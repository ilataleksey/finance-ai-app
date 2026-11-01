from datetime import UTC, datetime, time
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from dependencies import get_db


router = APIRouter(
    prefix="/expenses",
    tags=["expenses"],
)




def get_end_of_day(date: datetime) -> datetime:
    return datetime.combine(
        date.date(),
        time(23, 59, 59),
    )


@router.post("", response_model=schemas.ExpenseResponse)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
):
    category = db.query(models.Category).filter(
        models.Category.id == expense.category_id
    ).first()

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    db_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category_id=expense.category_id,
        created_at=expense.created_at or datetime.now(UTC),
    )

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    return db_expense


@router.get("", response_model=List[schemas.ExpenseResponse])
def get_expenses(
    category: str | None = None,
    sort_by: str = "created_at",
    db: Session = Depends(get_db),
):
    query = db.query(models.Expense)

    if category:
        query = query.join(
            models.Expense.category
        ).filter(
            models.Category.name == category
        )

    if sort_by == "amount":
        query = query.order_by(models.Expense.amount.desc())
    else:
        query = query.order_by(models.Expense.created_at.desc())

    return query.all()


@router.get("/summary")
def get_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        models.Category.name,
        func.sum(models.Expense.amount)
    ).join(
        models.Expense,
        models.Category.id == models.Expense.category_id
    )

    if start_date:
        query = query.filter(models.Expense.created_at >= start_date)

    if end_date:
        end_of_day = get_end_of_day(end_date)
        query = query.filter(models.Expense.created_at <= end_of_day)

    results = (
        query.
        group_by(models.Category.name)
        .all()
    )

    return [
        {"category": category, "total": total}
        for category, total in results
    ]


@router.get("/daily")
def get_daily_expenses(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(
        # обрезает время оставляет только день
        func.date(models.Expense.created_at),
        func.sum(models.Expense.amount)
    )

    if start_date:
        query = query.filter(models.Expense.created_at >= start_date)

    if end_date:
        end_of_day = get_end_of_day(end_date)
        query = query.filter(models.Expense.created_at <= end_of_day)

    result = query.group_by(
        func.date(models.Expense.created_at)
    ).order_by(
        func.date(models.Expense.created_at)
    ).all()

    return [
        {"date": date, "total": total}
        for date, total in result
    ]


@router.get("/list", response_model=List[schemas.ExpenseResponse])
def get_expense_list(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = (db.query(models.Expense))

    if start_date:
        query = query.filter(models.Expense.created_at >= start_date)

    if end_date:
        end_of_day = get_end_of_day(end_date)
        query = query.filter(models.Expense.created_at <= end_of_day)

    expenses = query.order_by(models.Expense.created_at.desc()).all()

    return [
        {
            "id": e.id,
            "title": e.title,
            "amount": e.amount,
            "created_at": e.created_at,
            "category": {
                "id": e.category_id,
                "name": e.category.name,
            },
        }
        for e in expenses
    ]


@router.get("/stats")
def get_expenses_stats(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        db: Session = Depends(get_db)
):
    query = db.query(models.Expense)

    if start_date:
        query = query.filter(models.Expense.created_at >= start_date)

    if end_date:
        end_of_day = get_end_of_day(end_date)
        query = query.filter(models.Expense.created_at <= end_of_day)

    expenses = query.order_by(models.Expense.created_at.desc()).all()

    total_expenses = sum(e.amount for e in expenses)

    transactions_count = len(expenses)

    avg_per_day = 0

    if expenses:
        dates = [
            e.created_at.date()
            for e in expenses
        ]

        days = (
            max(dates) - min(dates)
        ).days + 1

        avg_per_day = total_expenses / days

    category_totals = {}

    for e in expenses:
        category_name = e.category.name

        if category_name not in category_totals:
            category_totals[category_name] = 0

        category_totals[category_name] += e.amount

    top_category = None

    if category_totals:
        top_category = max(
            category_totals,
            key=category_totals.get
        )

    return {
        "total_expenses": round(total_expenses, 2),
        "transactions_count": transactions_count,
        "avg_per_day": round(avg_per_day, 2),
        "top_category": top_category,
    }


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found",
        )

    db.delete(expense)
    db.commit()

    return {"message": "Deleted"}
