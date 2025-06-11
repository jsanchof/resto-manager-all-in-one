from flask import request, jsonify, Blueprint
from src.api import db
from src.api.models import User, Table, table_status
from flask_jwt_extended import jwt_required, get_jwt_identity

tables_api = Blueprint("tables_api", __name__)


# Admin Authentication Check
def admin_required(f):
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(email=current_user_id).first()
        if not user or user.role != "ADMIN":
            return jsonify({"error": "Admin privileges required"}), 403
        return f(*args, **kwargs)

    wrapper.__name__ = f.__name__
    return jwt_required()(wrapper)


@tables_api.route("/tables", methods=["POST"])
@admin_required
def create_table():
    # Create table
    try:
        data = request.get_json()
        table = Table(
            number=data.get("number"),
            chairs=data.get("chairs"),
            status=table_status.AVAILABLE,
        )
        db.session.add(table)
        db.session.commit()
        return (
            jsonify(
                {
                    "msg": "Table created successfully",
                    "table": table.serialize(),
                }
            ),
            201,
        )
    except Exception as e:
        print("Error creating table:", e)
        return (
            jsonify({"error": "An error occurred while creating the table"}),
            500,
        )


@tables_api.route("/tables", methods=["GET"])
def get_tables():
    try:
        tables = Table.query.all()
        return (
            jsonify({"tables": [table.serialize() for table in tables]}),
            200,
        )
    except Exception as e:
        print("Error getting tables:", e)
        return (
            jsonify({"error": "An error occurred while getting the tables"}),
            500,
        )


@tables_api.route("/tables/<int:id>", methods=["PUT"])
@admin_required
def update_table(id):
    try:
        table = Table.query.get(id)
        if not table:
            return jsonify({"error": "Table not found"}), 404

        data = request.get_json()
        table.number = data.get("number", table.number)
        table.chairs = data.get("chairs", table.chairs)
        table.status = table_status(data.get("status", table.status.value))

        db.session.commit()
        return jsonify({"message": "Table updated successfully"}), 200

    except Exception as e:
        print("Error updating table:", e)
        return (
            jsonify({"error": "An error occurred while updating the table"}),
            500,
        )


@tables_api.route("/tables/<int:id>", methods=["DELETE"])
@admin_required
def delete_table(id):
    try:
        table = Table.query.get(id)
        if not table:
            return jsonify({"error": "Table not found"}), 404

        db.session.delete(table)
        db.session.commit()
        return jsonify({"message": "Table deleted successfully"}), 200

    except Exception as e:
        print("Error deleting table:", e)
        return (
            jsonify({"error": "An error occurred while deleting the table"}),
            500,
        )
