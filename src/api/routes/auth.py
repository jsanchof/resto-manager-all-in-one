from flask import Blueprint, jsonify, request, render_template
from src.api.models import User, user_role
from src.api import db, bcrypt
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity,
    get_jwt,
)
from src.api.utils import send_email
from datetime import timedelta
import os
from sqlalchemy import select, func

auth = Blueprint("auth", __name__)


def generate_verification_token(user_id):
    additional_claims = {"user_id": user_id}
    token = create_access_token(
        identity=str(user_id),
        additional_claims=additional_claims,
        expires_delta=timedelta(hours=24),
    )
    return token


def send_verification_email(user_email, user_id):
    token = generate_verification_token(user_id)
    frontend_url = os.getenv("FRONTEND_URL", "").strip('"').strip("'")

    if not frontend_url:
        raise RuntimeError("FRONTEND_URL not properly configured")

    verification_url = f"{frontend_url}/verify-email?token={token}"
    html_body = render_template(
        "email_verification.html",
        verification_url=verification_url,
    )
    send_email(
        user_email,
        "Verify your email address",
        html_body,
        is_html=True,
    )


@auth.route("/register", methods=["POST"])
def handle_register():
    try:
        data = request.get_json(silent=True)

        name = data.get("name")
        last_name = data.get("last_name")
        phone_number = data.get("phone_number")
        email = data.get("email")
        password = data.get("password")
        role_str = (data.get("role") or "").upper()

        if not all([name, last_name, phone_number, email, password, role_str]):
            return jsonify({"msg": "All fields are required"}), 400

        existing_user = db.session.scalar(db.select(User).where(User.email == email))
        if existing_user:
            return jsonify({"msg": "User already exists"}), 409

        valid_roles = [r.value for r in user_role]
        if role_str not in valid_roles:
            return (
                jsonify({"msg": "Invalid role", "valid_roles": valid_roles}),
                400,
            )

        role = user_role(role_str)
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        new_user = User(
            name=name,
            last_name=last_name,
            phone_number=phone_number,
            email=email,
            password=password_hash,
            role=role,
            is_active=False,
        )

        db.session.add(new_user)
        db.session.commit()
        send_verification_email(new_user.email, new_user.id)

        return jsonify({"ok": True, "msg": "Registration successful"}), 201
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


@auth.route("/login", methods=["POST"])
def handle_login():
    try:
        data = request.get_json(silent=True)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"msg": "Correo y contraseña requeridos"}), 400

        user = db.session.scalar(db.select(User).where(User.email == email))
        if not user:
            return jsonify({"msg": "El usuario no existe"}), 404

        if not user.is_active:
            return (
                jsonify({"msg": "Debe verificar su correo electrónico"}),
                403,
            )

        if not bcrypt.check_password_hash(user.password, password):
            return (
                jsonify({"msg": "El correo o la contraseña son incorrectos"}),
                401,
            )

        user_role = user.role.value
        claims = {"role": user_role, "email": user.email, "user_id": user.id}
        access_token = create_access_token(
            identity=str(user.id), additional_claims=claims
        )

        return (
            jsonify(
                {
                    "ok": True,
                    "msg": "¡Login exitoso!",
                    "access_token": access_token,
                    "role": user_role,
                    "user": {
                        "id": user.id,
                        "name": user.name,
                        "email": user.email,
                        "role": user_role,
                    },
                }
            ),
            200,
        )
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


@auth.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_email = get_jwt_identity()
    user = db.session.scalar(db.select(User).where(User.email == user_email))

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return (
        jsonify(
            {
                "name": user.name,
                "lastName": user.last_name,
                "telephone": user.phone_number,
                "email": user.email,
            }
        ),
        200,
    )


@auth.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_email = get_jwt_identity()
    user = db.session.scalar(db.select(User).where(User.email == user_email))

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    user.name = data.get("name", user.name)
    user.last_name = data.get("lastName", user.last_name)
    user.phone_number = data.get("telephone", user.phone_number)
    user.email = data.get("email", user.email)

    db.session.commit()
    return jsonify({"msg": "Perfil actualizado correctamente"}), 200


@auth.route("/verify-email", methods=["POST"])
@jwt_required()
def handle_verify_email():
    try:
        claims = get_jwt()
        user_id = claims["user_id"]
        user = db.session.scalar(db.select(User).where(User.id == user_id))
        user.is_active = True
        db.session.commit()
        return jsonify({"msg": "Correo verificado correctamente"}), 200
    except Exception as e:
        return jsonify({"msg": "Ocurrió un error al validar la cuenta"}), 500


@auth.route("/users", methods=["GET"])
def list_users():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        is_active_param = request.args.get("is_active")
        role_param = request.args.get("role")
        email_search = request.args.get("email", "").strip()

        stmt_base = select(User)

        # Filter by is_active
        if is_active_param is not None:
            if is_active_param.lower() == "true":
                stmt_base = stmt_base.where(User.is_active.is_(True))
            elif is_active_param.lower() == "false":
                stmt_base = stmt_base.where(User.is_active.is_(False))
            else:
                return (
                    jsonify({"error": "is_active parameter must be 'true' or 'false'"}),
                    400,
                )

        # Filter by role
        if role_param:
            role_upper = role_param.upper()
            try:
                role_enum = user_role[role_upper]
                stmt_base = stmt_base.where(User.role == role_enum)
            except KeyError:
                return (
                    jsonify(
                        {
                            "error": f"Rol inválido. Debe ser uno de: {[r.name for r in user_role]}",
                        }
                    ),
                    400,
                )

        # Filter by email (partial search, case insensitive)
        if email_search:
            stmt_base = stmt_base.where(User.email.ilike(f"%{email_search}%"))

        # Total with filters
        total = db.session.scalar(
            select(func.count()).select_from(stmt_base.subquery())
        )

        # Pagination
        stmt = (
            stmt_base.order_by(User.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )

        users = db.session.scalars(stmt).all()

        return (
            jsonify(
                {
                    "total": total,
                    "page": page,
                    "per_page": per_page,
                    "pages": (total + per_page - 1) // per_page,
                    "items": [user.serialize() for user in users],
                }
            ),
            200,
        )

    except Exception as e:
        print("Error listing users:", e)
        return jsonify({"error": "Error al obtener los usuarios"}), 500


@auth.route("/users/<int:id>", methods=["GET"])
def get_user_by_id(id):
    try:
        user = db.session.get(User, id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify(user.serialize()), 200
    except Exception as e:
        print("Error getting user by ID:", e)
        return jsonify({"error": "Error al buscar el usuario"}), 500


@auth.route("/users/<int:user_id>", methods=["PUT"])
def edit_user(user_id):
    try:
        data = request.get_json(silent=True)
        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        # Update fields if present in request
        if "name" in data:
            user.name = data["name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "phone_number" in data:
            user.phone_number = data["phone_number"]
        if "email" in data:
            # Check if email exists in another user
            existing_user = User.query.filter(
                User.email == data["email"], User.id != user_id
            ).first()
            if existing_user:
                return (
                    jsonify({"msg": "El correo electrónico ya está en uso"}),
                    400,
                )
            user.email = data["email"]
        if "password" in data:
            user.password = bcrypt.generate_password_hash(data["password"]).decode(
                "utf-8"
            )
        if "role" in data:
            role_str = data["role"].upper()
            valid_roles = [r.value for r in user_role]
            if role_str not in valid_roles:
                return (
                    jsonify({"msg": "Rol inválido", "valid_roles": valid_roles}),
                    400,
                )
            user.role = user_role(role_str)

        db.session.commit()
        return (
            jsonify({"ok": True, "msg": "Usuario actualizado correctamente"}),
            200,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al actualizar usuario: {str(e)}"}), 500


@auth.route("/users", methods=["DELETE"])
def delete_user():
    try:
        data = request.get_json(silent=True)
        email = data.get("email")

        if not email:
            return jsonify({"msg": "El campo 'email' es requerido"}), 400

        user = db.session.scalar(db.select(User).where(User.email == email))
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        db.session.delete(user)
        db.session.commit()

        return (
            jsonify(
                {
                    "ok": True,
                    "msg": f"Usuario con email {email} eliminado correctamente",
                }
            ),
            200,
        )
    except Exception as e:
        print("Error deleting user:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500
