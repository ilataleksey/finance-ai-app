from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
from database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

    expenses = relationship("Expense", back_populates="category")
    budgets = relationship("Budget", back_populates="category")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    amount = Column(Float)

    # ForeignKey связывает таблицы
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="expenses")

    created_at = Column(DateTime, default=lambda: datetime.now(UTC))


class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
    amount = Column(Float)

    created_at = Column(DateTime, default=lambda: datetime.now(UTC))


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        unique=True,
    )

    year = Column(String)
    month = Column(String)
    amount = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))

    category = relationship("Category", back_populates="budgets")
