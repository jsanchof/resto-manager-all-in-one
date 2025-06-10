import os
from flask import jsonify, url_for, render_template
import smtplib
import traceback
from email.message import EmailMessage
from typing import Any, Dict, Optional, Union


class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["message"] = self.message
        return rv


def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)


def generate_sitemap(app):
    links = ["/admin/"]
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return (
        """
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">"""
        + links_html
        + "</ul></div>"
    )


def send_email(to_email, subject, body, is_html=False):
    try:
        smtp_server = os.getenv("MAIL_SERVER")
        smtp_port = int(os.getenv("MAIL_PORT", 587))
        smtp_user = os.getenv("MAIL_USERNAME")
        smtp_pass = os.getenv("MAIL_PASSWORD")

        if not smtp_server or not smtp_user or not smtp_pass:
            raise ValueError("Faltan variables de entorno para configurar el correo")

        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = smtp_user
        msg["To"] = to_email
        # msg["Bcc"] = smtp_user  # Copia oculta al remitente

        if is_html:
            msg.set_content("Your email client does not support HTML.")
            msg.add_alternative(body, subtype="html")
        else:
            msg.set_content(body)

        with smtplib.SMTP(smtp_server, smtp_port) as smtp:
            smtp.starttls()
            smtp.login(smtp_user, smtp_pass)
            smtp.send_message(msg)

        return True  # Envío exitoso

    except Exception as e:
        print("❌ Error al enviar correo:")
        traceback.print_exc()
        return False


# Envio de correos de reservas


def send_email_reservation(data):
    try:
        guest_name = data.get("guest_name")
        guest_phone = data.get("guest_phone")
        email = data.get("email")
        quantity = data.get("quantity")
        start_date_time = data.get("start_date_time")
        additional_details = data.get("additional_details")

        subject = f"New Reservation Request from {guest_name}"

        admin_email = os.getenv("MAIL_USERNAME")

        html_user_body = render_template(
            "email_confirmacion_reserva_usuario.html",
            guest_name=guest_name,
            guest_phone=guest_phone,
            quantity=quantity,
            start_date_time=start_date_time,
            additional_details=additional_details,
        )
        html_admin_body = render_template(
            "email_reserva_admin.html",
            guest_name=guest_name,
            guest_phone=guest_phone,
            quantity=quantity,
            start_date_time=start_date_time,
            additional_details=additional_details,
        )

        send_email(
            email,
            "Your reservation request has been received!",
            html_user_body,
            is_html=True,
        )
        send_email(admin_email, subject, html_admin_body, is_html=True)

        return True  # o return {"status": "success"}

    except Exception as e:
        print(f"Error enviando correo: {e}")
        return False  # o return {"status": "error", "details": str(e)}


def create_api_response(
    data: Optional[Any] = None,
    message: Optional[str] = None,
    status_code: int = 200,
    error: Optional[str] = None,
) -> tuple[Dict[str, Any], int]:
    """
    Create a standardized API response.

    Args:
        data: The data to return (optional)
        message: A success/info message (optional)
        status_code: HTTP status code (default 200)
        error: Error message in case of error (optional)

    Returns:
        A tuple of (response_dict, status_code)
    """
    response = {"success": 200 <= status_code < 300, "status_code": status_code}

    if data is not None:
        response["data"] = data

    if message is not None:
        response["message"] = message

    if error is not None:
        response["error"] = error

    return jsonify(response), status_code


# Standard pagination response
def create_paginated_response(
    items: list, total: int, page: int, per_page: int, message: Optional[str] = None
) -> tuple[Dict[str, Any], int]:
    """
    Create a standardized paginated response.

    Args:
        items: List of items for current page
        total: Total number of items
        page: Current page number
        per_page: Number of items per page
        message: Optional message

    Returns:
        A tuple of (response_dict, status_code)
    """
    total_pages = (total + per_page - 1) // per_page

    data = {
        "items": items,
        "pagination": {
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }

    return create_api_response(data=data, message=message)
