from flask import request, jsonify, render_template
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta
import os
from api.models import db, User, user_role
from api.utils import send_email
from . import api
from api.extensions import bcrypt
from sqlalchemy import func

def generate_verification_token(user_id):
    additional_claims = {"user_id": user_id}
    token = create_access_token(
        identity=str(user_id),
        additional_claims=additional_claims,
        expires_delta=timedelta(hours=24)
    )
    return token

def send_verification_email(user_email, user_id):
    token = generate_verification_token(user_id)
    frontend_url = os.getenv("FRONTEND_URL", "").strip('"').strip("'")

    if not frontend_url:
        raise RuntimeError("FRONTEND_URL no está definido correctamente")

    verification_url = f"{frontend_url}/verify-email?token={token}"
    html_body = render_template("email_verification.html", verification_url=verification_url)
    send_email(user_email, "Verifica tu correo electrónico", html_body, is_html=True)

@api.route('/register', methods=['POST'])
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
            return jsonify({"msg": "Todos los campos son requeridos"}), 400

        existing_user = db.session.scalar(db.select(User).where(User.email == email))
        if existing_user:
            return jsonify({"msg": "El usuario ya existe"}), 409

        valid_roles = [r.value for r in user_role]
        if role_str not in valid_roles:
            return jsonify({
                "msg": "Rol inválido",
                "valid_roles": valid_roles
            }), 400

        role = user_role(role_str)
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        new_user = User(
            name=name,
            last_name=last_name,
            phone_number=phone_number,
            email=email,
            password=password_hash,
            role=role,
            is_active=False
        )

        db.session.add(new_user)
        db.session.commit()
        send_verification_email(new_user.email, new_user.id)

        return jsonify({"ok": True, "msg": "Register was successful..."}), 201

    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500

@api.route('/login', methods=['POST'])
def handle_login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"msg": "Email y contraseña son requeridos"}), 400

        user = db.session.scalar(db.select(User).where(User.email == email))

        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"msg": "Contraseña incorrecta"}), 401

        if not user.is_active:
            return jsonify({"msg": "Por favor verifica tu correo electrónico"}), 401

        access_token = create_access_token(identity=email)
        return jsonify({
            "token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role.value
            }
        }), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"msg": str(e)}), 500

@api.route("/verify-email", methods=['POST'])
@jwt_required()
def handle_verify_email():
    try:
        claims = get_jwt()
        user_id = claims.get("user_id")
        
        if not user_id:
            return jsonify({"msg": "Token inválido"}), 400

        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        user.is_active = True
        db.session.commit()

        return jsonify({"msg": "Email verificado correctamente"}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"msg": str(e)}), 500

@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_email = get_jwt_identity()
    user = db.session.scalar(db.select(User).where(User.email == user_email))

    if user is None:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify({
        "name": user.name,
        "lastName": user.last_name,
        "telephone": user.phone_number,
        "email": user.email
    }), 200

@api.route('/profile', methods=['PUT'])
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

@api.route('/users', methods=['GET'])
def listar_usuarios():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        search = request.args.get("search", "").strip()
        role_filter = request.args.get("role", "").upper().strip()

        stmt = db.select(User)

        if search:
            stmt = stmt.where(
                db.or_(
                    User.name.ilike(f"%{search}%"),
                    User.last_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )

        if role_filter:
            if role_filter in user_role.__members__:
                stmt = stmt.where(User.role == user_role[role_filter])
            else:
                return jsonify({
                    "error": f"Rol inválido. Usa uno de: {[r.name for r in user_role]}"
                }), 400

        total = db.session.scalar(db.select(func.count()).select_from(stmt.subquery()))

        stmt = stmt.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
        users = db.session.scalars(stmt).all()

        return jsonify({
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
            "items": [user.serialize() for user in users]
        }), 200

    except Exception as e:
        print("Error en GET /users:", e)
        return jsonify({"error": str(e)}), 500

@api.route('/users/<int:id>', methods=['GET'])
def obtener_usuario_por_id(id):
    try:
        user = User.query.get(id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify(user.serialize()), 200
    except Exception as e:
        print("Error al obtener usuario:", e)
        return jsonify({"error": str(e)}), 500 