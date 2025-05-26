"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory, render_template
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap, send_email
from api.models import db, User, user_role, Dishes, dish_type, Drinks, drink_type
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import timedelta
from sqlalchemy import select, func
from api.extensions import bcrypt, jwt, cors
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, get_jwt

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')

app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "da_secre_qi"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt.init_app(app)
cors.init_app(app)
bcrypt.init_app(app)
app.url_map.strict_slashes = False

# database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    # Use a local SQLite database file
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'app.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# Esto permite importarlo desde otros archivos como hiciste en seed.py
__all__ = ['app', 'db', 'bcrypt']

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Functions to generate token and send verification frontend url
# Generate verification token


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

    html_body = render_template(
        "email_verification.html", verification_url=verification_url)

    send_email(user_email, "Verifica tu correo electrónico",
               html_body, is_html=True)

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


@app.route('/register', methods=['POST'])
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

        existing_user = db.session.scalar(
            db.select(User).where(User.email == email))

        if existing_user:
            return jsonify({"msg": "El usuario ya existe"}), 409

        if not name or not last_name or not phone_number or not role_str:
            return jsonify({"msg": "Todos los campos son requeridos"}), 400

        valid_roles = [r.value for r in user_role]
        if role_str not in valid_roles:
            return jsonify({
                "msg": "Rol inválido",
                "valid_roles": valid_roles
            }), 400

        role = user_role(role_str)
        print(role)
        password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

        new_user = User(name=name, last_name=last_name, phone_number=phone_number,
                        email=email, password=password_hash, role=role, is_active=False)

        db.session.add(new_user)
        db.session.commit()
        send_verification_email(new_user.email, new_user.id)

        return jsonify({"ok": True, "msg": "Register was successfull..."}), 201
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500

# Obtiene los datos del usuario registrado


@app.route('/profile', methods=['GET'])
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

# Actualiza los datos del usuario registrado


@app.route('/profile', methods=['PUT'])
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

# Validar usuario o confirmar usuario


@app.route("/verify-email", methods=['POST'])
@jwt_required()
def handle_verify_email():
    try:
        # Obtener el user_id desde los claims adicionales
        claims = get_jwt()  # Devuelve el payload completo (incluyendo los claims adicionales)
        user_id = claims['user_id']
        # Buscamos el usuario para actualizarlo en la bd
        user = db.session.scalar(db.select(User).where(User.id == user_id))
        user.is_active = True
        db.session.commit()
        return jsonify({"msg": "Correo verificado correctamente"}), 200
    except Exception as e:
        return jsonify({"msg": "Ocurrió un error al validar la cuenta"}), 500


@app.route('/login', methods=['POST'])
def handle_login():
    try:
        data = request.get_json(silent=True)
        print("Data del body", data)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"msg": "Correo y contraseña requeridos"}), 400

        user = db.session.scalar(db.select(User).where(User.email == email))
        if not user:
            return jsonify({"msg": "El usuario no existe"}), 404

        if not user.is_active:
            return jsonify({"msg": "Debe verificar su correo electrónico"}), 403
        
        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({"msg": "El correo o la contraseña son incorrectos"}), 401

        # after confirminh the details are valid, generate the token
        user_role = user.role.value
        claims = {"role": user_role, "more details": "the details"}
        access_token = create_access_token(
            identity=str(email), additional_claims=claims)

        return jsonify({"ok": True, "msg": "¡Login exitoso!", "access_token": access_token, "role": user_role}), 200
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


@app.route('/edit_user/<int:user_id>', methods=['PUT'])
def edit_user(user_id):
    try:
        data = request.get_json(silent=True)

        name = data.get("name")
        last_name = data.get("last_name")
        phone_number = data.get("phone_number")
        email = data.get("email")
        password = data.get("password")
        role_str = (data.get("role") or "").upper()

        user = db.session.get(User, user_id)

        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404

        # Actualizar campos si están presentes en la solicitud
        if name:
            user.name = name
        if last_name:
            user.last_name = last_name
        if phone_number:
            user.phone_number = phone_number
        if email:
            # Verificar si el email ya existe en otro usuario
            existing_user = User.query.filter(
                User.email == email, User.id != user_id).first()
            if existing_user:
                return jsonify({"msg": "El correo electrónico ya está en uso"}), 400
            user.email = email
        if password:
            user.password = bcrypt.generate_password_hash(
                password).decode("utf-8")
        if role_str:
            valid_roles = [r.value for r in user_role]
            if role_str not in valid_roles:
                return jsonify({
                    "msg": "Rol inválido",
                    "valid_roles": valid_roles
                }), 400
            user.role = user_role(role_str)

        db.session.commit()

        return jsonify({"ok": True, "msg": "Usuario actualizado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error al actualizar usuario: {str(e)}"}), 500

    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


@app.route('/delete/user', methods=['DELETE'])
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

        return jsonify({"ok": True, "msg": f"Usuario con email {email} eliminado correctamente"}), 200

    except Exception as e:
        print("Error al eliminar usuario:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


@app.route('/users', methods=['GET'])
def listar_usuarios():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        is_active_param = request.args.get("is_active")
        role_param = request.args.get("role")
        email_search = request.args.get("email", "").strip()

        stmt_base = select(User)

        # Filtro por is_active
        if is_active_param is not None:
            if is_active_param.lower() == "true":
                stmt_base = stmt_base.where(User.is_active == True)
            elif is_active_param.lower() == "false":
                stmt_base = stmt_base.where(User.is_active == False)
            else:
                return jsonify({"error": "El parámetro 'is_active' debe ser 'true' o 'false'"}), 400

        # Filtro por role
        if role_param:
            role_upper = role_param.upper()
            try:
                role_enum = user_role[role_upper]
                stmt_base = stmt_base.where(User.role == role_enum)
            except KeyError:
                return jsonify({"error": f"Rol inválido. Debe ser uno de: {[r.name for r in user_role]}"}), 400

        # Filtro por email (búsqueda parcial, insensible a mayúsculas)
        if email_search:
            stmt_base = stmt_base.where(User.email.ilike(f"%{email_search}%"))

        # Total con filtros
        total = db.session.scalar(select(func.count()).select_from(stmt_base.subquery()))

        # Paginación
        stmt = (
            stmt_base
            .order_by(User.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )

        users = db.session.scalars(stmt).all()

        return jsonify({
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
            "items": [user.serialize() for user in users]
        }), 200

    except Exception as e:
        print("Error al listar usuarios:", e)
        return jsonify({"error": "Error al obtener los usuarios"}), 500

@app.route('/users/<int:id>', methods=['GET'])
def obtener_usuario_por_id(id):
    try:
        user = db.session.get(User, id)

        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        return jsonify(user.serialize()), 200

    except Exception as e:
        print("Error al obtener usuario por ID:", e)
        return jsonify({"error": "Error al buscar el usuario"}), 500

# Dishes endpoints


@app.route('/dishes', methods=['POST'])
def handle_add_dish():
    try:
        data = request.get_json(silent=True)

        name = data.get("name")
        description = data.get("description")
        url_img = data.get("url_img")
        price = data.get("price")
        type_str = (data.get("type") or "").upper()

        if not all([name, description, price, type_str]):
            return jsonify({"msg": "Todos los campos son requeridos"}), 400

        existing_dish = db.session.scalar(
            db.select(Dishes).where(Dishes.name == name))

        if existing_dish:
            return jsonify({"msg": "El platillo ya existe"}), 409

        valid_types = [r.value for r in dish_type]
        if type_str not in valid_types:
            return jsonify({
                "msg": "Tipo inválido",
                "valid_types": valid_types
            }), 400

        type = dish_type(type_str)

        new_dish = Dishes(name=name, description=description, url_img=url_img,
                          price=price, type=type, is_active=True)

        db.session.add(new_dish)
        db.session.commit()

        return jsonify({"ok": True, "msg": "Register dish was successfull..."}), 201
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


@app.route('/dishes', methods=['GET'])
def get_all_dishes():
    try:
        dishes = Dishes.query.all()
        dish_list = [dish.serialize() for dish in dishes]

        return jsonify(dish_list), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route('/dishes/<int:dish_id>', methods=['GET'])
def get_dish_by_id(dish_id):
    try:
        dish = Dishes.query.get(dish_id)
        if dish is None:
            return jsonify({"error": "No se encontró el platillo"}), 404

        return jsonify(dish.serialize()), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route('/dishes/<int:dish_id>', methods=['PUT'])
def update_dish(dish_id):
    try:
        dish = Dishes.query.get(dish_id)
        if not dish:
            return jsonify({"error": "No se encontró el platillo"}), 404

        data = request.get_json()

        if "name" in data:
            dish.name = data["name"]
        if "description" in data:
            dish.description = data["description"]
        if "url_img" in data:
            dish.url_img = data["url_img"]
        if "price" in data:
            dish.price = data["price"]
        if "type" in data:
            dish.type = data["type"]

        db.session.commit()

        return jsonify(dish.serialize()), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route('/dishes/<int:dish_id>', methods=['DELETE'])
def delete_dish(dish_id):
    try:
        dish = Dishes.query.get(dish_id)
        if not dish:
            return jsonify({"msg": "El platillo no fue encontrado"}), 404

        db.session.delete(dish)
        db.session.commit()

        return jsonify({"ok": True, "msg": "Platillo eliminado exitosamente"}), 200

    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


# Drinks endpoints
@app.route('/drinks', methods=['POST'])
def handle_add_drink():
    try:
        data = request.get_json(silent=True)

        name = data.get("name")
        description = data.get("description")
        url_img = data.get("url_img")
        price = data.get("price")
        type_str = (data.get("type") or "").upper()

        if not all([name, description, price, type_str]):
            return jsonify({"msg": "Todos los campos son requeridos"}), 400

        existing_drink = db.session.scalar(
            db.select(Drinks).where(Drinks.name == name))

        if existing_drink:
            return jsonify({"msg": "La bebida ya existe"}), 409

        valid_types = [t.value for t in drink_type]
        if type_str not in valid_types:
            return jsonify({
                "msg": "Tipo inválido",
                "valid_types": valid_types
            }), 400

        type = drink_type(type_str)

        new_drink = Drinks(name=name, description=description, url_img=url_img,
                           price=price, type=type, is_active=True)

        db.session.add(new_drink)
        db.session.commit()

        return jsonify({"ok": True, "msg": "Register drink was successfull..."}), 201
    except Exception as e:
        print("Error:", str(e))
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


@app.route('/drinks', methods=['GET'])
def get_all_drinks():
    try:
        drinks = Drinks.query.all()
        drink_list = [drink.serialize() for drink in drinks]

        return jsonify(drink_list), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route('/drinks/<int:drink_id>', methods=['GET'])
def get_drink_by_id(drink_id):
    try:
        drink = Drinks.query.get(drink_id)
        if drink is None:
            return jsonify({"error": "No se encontró la bebida"}), 404

        return jsonify(drink.serialize()), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route('/drinks/<int:drink_id>', methods=['PUT'])
def update_drink(drink_id):
    try:
        drink = Drinks.query.get(drink_id)
        if not drink:
            return jsonify({"error": "No se encontró la bebida."}), 404

        data = request.get_json()

        if "name" in data:
            drink.name = data["name"]
        if "description" in data:
            drink.description = data["description"]
        if "url_img" in data:
            drink.url_img = data["url_img"]
        if "price" in data:
            drink.price = data["price"]
        if "type" in data:
            drink.type = data["type"]

        db.session.commit()

        return jsonify(drink.serialize()), 200

    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route('/drinks/<int:drink_id>', methods=['DELETE'])
def delete_drink(drink_id):
    try:
        drink = Drinks.query.get(drink_id)
        if not drink:
            return jsonify({"error": "No se encontró la bebida"}), 404

        db.session.delete(drink)
        db.session.commit()

        return jsonify({"ok": True, "msg": "Bebida eliminada correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"ok": False, "msg": str(e)}), 500


# Envio de correos formulario de contacto
@app.route("/contacto", methods=['POST'])
def handle_send_email_contacto():
    try:
        data = request.get_json(silent=True)
        print(data)
        if not data:
            return jsonify({"error": "Falta el cuerpo de la solicitud"}), 400

        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        if not name or not email or not message:
            return jsonify({"error": "Se requieren los campos: name, email y message"}), 400

        subject = f"Nuevo mensaje de contacto de {name}"
        admin_email = os.getenv("MAIL_USERNAME")

        # Cuerpo HTML
        html_user_body = render_template("email_pagina_contacto.html", name=name)
        html_admin_body = render_template("email_pagina_contacto_admin.html", name=name, message=message, email=email)

        # Enviar correos y verificar resultado
        user_sent = send_email(email, "Gracias por contactarnos", html_user_body, is_html=True)
        admin_sent = send_email(admin_email, subject, html_admin_body, is_html=True)

        if not user_sent or not admin_sent:
            return jsonify({
                "msg": "El mensaje fue recibido, pero hubo un problema al enviar el correo.",
                "user_sent": user_sent,
                "admin_sent": admin_sent
            }), 207  # 207 Multi-Status (respuesta parcial)

        return jsonify({"msg": "Mensaje enviado correctamente"}), 200

    except Exception as e:
        print("❌ Error en /contacto:", e)
        return jsonify({"error": "Ocurrió un error al procesar la solicitud"}), 500


@app.route("/init-admin", methods=["GET"])
def init_admin_db():
    secret = request.args.get("secret")
    expected_secret = os.getenv("INIT_SECRET", "supersecret123")

    if secret != expected_secret:
        return jsonify({"msg": "Acceso no autorizado"}), 401

    # Validación si ya existe
    existing = db.session.scalar(db.select(User).where(User.email == os.getenv("ADMIN_EMAIL", "admin@email.com")))
    if existing:
        return jsonify({"msg": "El usuario admin ya existe"}), 200

    hashed_password = bcrypt.generate_password_hash(os.getenv("ADMIN_PASSWORD", "admin123")).decode('utf-8')

    admin = User(
        name="Admin",
        last_name="Principal",
        phone_number="0999999999",
        email=os.getenv("ADMIN_EMAIL", "admin@email.com"),
        password=hashed_password,
        role=user_role.ADMIN,
        is_active=True
    )
    db.session.add(admin)
    db.session.commit()

    return jsonify({"msg": "Usuario admin creado exitosamente"}), 201

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
