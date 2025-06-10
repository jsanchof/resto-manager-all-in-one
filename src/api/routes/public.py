from flask import Blueprint, jsonify, request, render_template
from src.api.models import Dishes, Drinks, dish_type, drink_type
from src.api import db
from src.api.utils import send_email
import os

public = Blueprint("public", __name__)


# Dishes endpoints
@public.route("/dishes", methods=["GET"])
def get_all_dishes():
    try:
        dishes = Dishes.query.all()
        dish_list = [dish.serialize() for dish in dishes]
        return jsonify(dish_list), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@public.route("/dishes/<int:dish_id>", methods=["GET"])
def get_dish_by_id(dish_id):
    try:
        dish = Dishes.query.get(dish_id)
        if dish is None:
            return jsonify({"error": "No se encontró el platillo"}), 404
        return jsonify(dish.serialize()), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# Drinks endpoints
@public.route("/drinks", methods=["GET"])
def get_all_drinks():
    try:
        drinks = Drinks.query.all()
        drink_list = [drink.serialize() for drink in drinks]
        return jsonify(drink_list), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@public.route("/drinks/<int:drink_id>", methods=["GET"])
def get_drink_by_id(drink_id):
    try:
        drink = Drinks.query.get(drink_id)
        if drink is None:
            return jsonify({"error": "No se encontró la bebida"}), 404
        return jsonify(drink.serialize()), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


# Contact form
@public.route("/contact", methods=["POST"])
def handle_contact_email():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Falta el cuerpo de la solicitud"}), 400

        name = data.get("name")
        email = data.get("email")
        message = data.get("message")

        if not name or not email or not message:
            return (
                jsonify({"error": "Se requieren los campos: name, email y message"}),
                400,
            )

        subject = f"Nuevo mensaje de contacto de {name}"
        admin_email = os.getenv("MAIL_USERNAME")

        # HTML bodies
        html_user_body = render_template("email_pagina_contacto.html", name=name)
        html_admin_body = render_template(
            "email_pagina_contacto_admin.html", name=name, message=message, email=email
        )

        # Send emails and verify results
        user_sent = send_email(
            email, "Gracias por contactarnos", html_user_body, is_html=True
        )
        admin_sent = send_email(admin_email, subject, html_admin_body, is_html=True)

        if not user_sent or not admin_sent:
            return (
                jsonify(
                    {
                        "msg": "El mensaje fue recibido, pero hubo un problema al enviar el correo.",
                        "user_sent": user_sent,
                        "admin_sent": admin_sent,
                    }
                ),
                207,
            )  # 207 Multi-Status (partial response)

        return jsonify({"msg": "Mensaje enviado correctamente"}), 200

    except Exception as e:
        print("❌ Error in /contact:", e)
        return jsonify({"error": "Ocurrió un error al procesar la solicitud"}), 500
