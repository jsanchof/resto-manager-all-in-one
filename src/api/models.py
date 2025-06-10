from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Enum, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum as PyEnum
from sqlalchemy.sql import func
from datetime import datetime

db = SQLAlchemy()


class user_role(PyEnum):
    ADMIN = "ADMIN"
    CLIENT = "CLIENT"
    WAITER = "WAITER"
    KITCHEN = "KITCHEN"


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    phone_number: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(128), nullable=False)
    role: Mapped[user_role] = mapped_column(
        Enum(user_role, name="user_role_enum", native_enum=False), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=False)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(), default=func.now(), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "last_name": self.last_name,
            "phone_number": self.phone_number,
            "email": self.email,
            # do not serialize the password, its a security breach
            "role": self.role.value,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.created_at.isoformat() if self.created_at else None,
        }


# dishes enum and model


class dish_type(PyEnum):
    APPETIZER = "APPETIZER"
    MAIN = "MAIN"
    DESSERT = "DESSERT"


class Dishes(db.Model):
    __tablename__ = "dishes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(120), nullable=False)
    url_img: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    type: Mapped[dish_type] = mapped_column(
        Enum(dish_type, name="dish_type_enum", native_enum=False), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(), default=func.now(), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "url_img": self.url_img,
            "price": self.price,
            "type": self.type.value,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.created_at.isoformat() if self.created_at else None,
        }


# Drinks enum and model


class drink_type(PyEnum):
    SODA = "SODA"
    NATURAL = "NATURAL"
    BEER = "BEER"
    SPIRITS = "SPIRITS"


class Drinks(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(120), nullable=False)
    url_img: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(nullable=False)
    type: Mapped[drink_type] = mapped_column(
        Enum(drink_type, name="drink_type_enum", native_enum=False), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(), default=func.now(), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "url_img": self.url_img,
            "price": self.price,
            "type": self.type.value,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.created_at.isoformat() if self.created_at else None,
        }


# Reservation status
class reservation_status(PyEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class Reservation(db.Model):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    guest_name: Mapped[str] = mapped_column(String(120), nullable=False)
    guest_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    table_id: Mapped[int] = mapped_column(ForeignKey("tables.id"), nullable=True)
    status: Mapped[reservation_status] = mapped_column(
        Enum(reservation_status, native_enum=False), default=reservation_status.PENDING
    )
    start_date_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    additional_details: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(), default=func.now(), server_default=func.now(), nullable=False
    )

    # Relaciones opcionales
    # user = relationship("User", backref="reservations")
    # table = relationship("Table", backref="reservations")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "guest_name": self.guest_name,
            "guest_phone": self.guest_phone,
            "email": self.email,
            "quantity": self.quantity,
            "table_id": self.table_id,
            "status": self.status.value,
            "start_date_time": self.start_date_time.isoformat(),
            "additional_details": self.additional_details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# Reservation status


class table_status(PyEnum):
    FREE = "FREE"
    RESERVED = "RESERVED"
    OCCUPIED = "OCCUPIED"


class Table(db.Model):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    chairs: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[table_status] = mapped_column(Enum(table_status, native_enum=False))

    def serialize(self):
        return {
            "id": self.id,
            "number": self.number,
            "chairs": self.chairs,
            "status": self.status.value,
        }


class order_status(str, PyEnum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    READY = "READY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Order(db.Model):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    table_id: Mapped[int] = mapped_column(ForeignKey("tables.id"), nullable=True)
    status: Mapped[order_status] = mapped_column(
        Enum(order_status, native_enum=False), default=order_status.PENDING
    )
    total: Mapped[float] = mapped_column(nullable=False)
    take_away: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=False)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(), default=func.now(), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(),
        default=func.now(),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", backref="orders")
    creator = relationship("User", backref="created_orders")
    table = relationship("Table", backref="orders")
    details = relationship(
        "OrderDetail", back_populates="order", cascade="all, delete-orphan"
    )

    def serialize(self):
        try:
            return {
                "id": self.id,
                "orderId": self.order_code,
                "userId": self.user_id,
                "creatorId": self.creator_id,
                "customer": (
                    f"{self.user.name} {self.user.last_name}" if self.user else "Guest"
                ),
                "creator": (
                    f"{self.creator.name} {self.creator.last_name}"
                    if self.creator
                    else "Guest"
                ),
                "table": self.table.serialize() if self.table else None,
                "status": self.status.value,
                "total": float(self.total),
                "take_away": self.take_away,
                "date": self.created_at.strftime("%Y-%m-%d"),
                "details": (
                    [detail.serialize() for detail in self.details]
                    if self.details
                    else []
                ),
            }
        except Exception as e:
            print(f"Error serializing order {self.id}: {str(e)}")
            return {
                "id": self.id,
                "orderId": self.order_code,
                "userId": self.user_id,
                "creatorId": self.creator_id,
                "customer": "Error loading customer",
                "creator": "Error loading creator",
                "table": "Error loading table",
                "status": self.status.value,
                "total": float(self.total),
                "take_away": self.take_away,
                "date": self.created_at.strftime("%Y-%m-%d"),
                "details": [],
            }


class OrderDetail(db.Model):
    __tablename__ = "order_details"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    dish_id: Mapped[int] = mapped_column(ForeignKey("dishes.id"), nullable=True)
    drink_id: Mapped[int] = mapped_column(ForeignKey("drinks.id"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(120), nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False)
    unit_price: Mapped[float] = mapped_column(nullable=False)

    order = relationship("Order", back_populates="details")
    dish = relationship("Dishes", foreign_keys=[dish_id])
    drink = relationship("Drinks", foreign_keys=[drink_id])

    def serialize(self):
        return {
            "id": self.id,
            "name": self.product_name,
            "quantity": self.quantity,
            "price": self.unit_price,
            "subtotal": round(self.unit_price * self.quantity, 2),
            "type": "FOOD" if self.dish_id else "DRINK",
        }
