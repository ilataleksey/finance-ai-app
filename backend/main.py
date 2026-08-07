from http.client import responses

from fastapi import FastAPI, Depends, Body, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic.v1.schema import normalize_name
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from database import engine, SessionLocal
from typing import List, Any
from datetime import datetime, UTC, time
from typing import Optional
import schemas
import models

"""
FastAPI создает сервер приложения
@app.get("/") главная страница API
/health проверка, жив ли сервер (важно для деплой)

Bash
source venv/bin/activate - активация виртуального окружения
uvicorn main:app --reload - запуск сервера

Web
http://127.0.0.1:8000/ - стартовая страница
http://127.0.0.1:8000/health - статус сервера
http://127.0.0.1:8000/docs - автодокументация API
"""

app = FastAPI()

# добавляем CORS для подключения frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# создает таблицы в БД
models.Base.metadata.create_all(bind=engine)

# создае м подключение к БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_end_of_day(date: datetime) -> datetime:
    return datetime.combine(
        date.date(),
        time(23, 59, 59),
    )


@app.post("/expenses", response_model=schemas.ExpenseResponse)
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
            detail="Category not found"
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


@app.post("/categories")
def create_category(name: str, db: Session = Depends(get_db)):
    normalized_name = name.strip().lower()

    existing = db.query(models.Category).filter(
        func.lower(models.Category.name) == normalized_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Category already exists",
        )
    category = models.Category(name=normalized_name)

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


@app.get("/expenses", response_model=List[schemas.ExpenseResponse])
def get_expenses(
        # параметр из URL: /expenses?category=food
        category: str | None = None,
        sort_by: str = "created_at",
        db: Session = Depends(get_db)
):
    query = db.query(models.Expense)

    if category:
        query = query.filter(models.Expense.category == category)

    if sort_by == "amount":
        query = query.order_by(models.Expense.amount.desc())
    else:
        query = query.order_by(models.Expense.created_at.desc())

    expenses = query.all()
    return expenses


@app.get("/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@app.get("/expenses/summary")
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


@app.get("/expenses/daily")
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


@app.get("/expenses/list", response_model=List[schemas.ExpenseResponse])
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


@app.get("/expenses/stats")
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




@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id
    ).first()

    if not (expense):
        raise HTTPException(
            status_code=404, detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {"message": "Deleted"}


@app.get("/")
def root():
    return {"message": "Finance AI API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/incomes", response_model=schemas.IncomeResponse)
def create_income(
        income: schemas.IncomeCreate,
        db: Session = Depends(get_db)
):
    db_income = models.Income(
        source=income.source,
        amount=income.amount,
        create_at=income.create_at or datetime.now(UTC),
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income


@app.get("/incomes", response_model=List[schemas.IncomeResponse])
def get_incomes(db: Session = Depends(get_db)):
    return db.query(models.Income).order_by(
        models.Income.created_at.desc()
    ).all()


@app.get("/balance")
def get_balance(db: Session = Depends(get_db)):
    total_income = db.query(
        func.sum(models.Income.amount)
    ).scalar() or 0

    total_expenses = db.query(
        func.sum(models.Expense.amount)
     ).scalar() or 0

    balance = total_income - total_expenses

    return {
        "income": total_income,
        "expenses": total_expenses,
        "balance": balance,
    }


@app.post("/budgets", response_model=schemas.BudgetResponse)
def create_budget(
        budget: schemas.BudgetCreate,
        db: Session = Depends(get_db),
):
    category = (
        db.query(models.Category)
        .filter(models.Category.id == budget.category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )

    existing = (
        db.query(models.Budget)
        .filter(
            models.Budget.category_id == budget.category_id,
            models.Budget.year == budget.year,
            models.Budget.month == budget.month,
        )
        .first()
    )

    if existing:
        existing.amount = budget.amount
        db.commit()
        db.refresh(existing)

        return existing

    new_budget = models.Budget(
        category_id = budget.category_id,
        amount = budget.amount,
        year = budget.year,
        month = budget.month,
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


@app.delete("/budgets", status_code=204)
def delete_budget(
        category_id: int = Query(gt=0),
        year: int = Query(ge=2000, le=2100),
        month: int = Query(ge=1, le=12),
        db: Session = Depends(get_db),
):
    budget = (
        db.query(models.Budget)
        .filter(
            models.Budget.category_id == category_id,
            models.Budget.year == year,
            models.Budget.month == month,
        )
        .first()
    )

    if budget:
        db.delete(budget)
        db.commit()


@app.get("/budgets/plan", response_model=schemas.BudgetPlanResponse)
def get_budget_plan(
        year: int = Query(ge=2000, le=2100),
        db: Session = Depends(get_db),
):
    year_start = datetime(year=year, month=1, day=1)
    next_year_start = datetime(year=year+1, month=1, day=1)

    categories = (
        db.query(models.Category)
        .order_by(func.lower(models.Category.name), models.Category.id)
        .all()
    )

    budget_rows = (
        db.query(models.Budget)
        .filter(models.Budget.year == year)
        .all()
    )

    actual_rows = (
        db.query(
            models.Expense.category_id,
            extract("month", models.Expense.created_at).label("month"),
            func.sum(models.Expense.amount).label("actual"),
        )
        .filter(
            models.Expense.created_at >= year_start,
            models.Expense.created_at < next_year_start,
        )
        .group_by(
            models.Expense.category_id,
            extract("month", models.Expense.created_at),
        )
        .all()
    )

    planned_by_period = {
        (budget.category_id, budget.month): float(budget.amount)
        for budget in budget_rows
    }

    actual_by_period = {
        (row.category_id, int(row.month)): float(row.actual)
        for row in actual_rows
    }

    plan_categories = []

    for category in categories:
        months = []

        for month in range(1, 13):
            planned = planned_by_period.get((category.id, month))
            actual = actual_by_period.get((category.id, month), 0)

            percent = (
                round((actual / planned) * 100, 2)
                if planned is not None
                else None
            )

            months.append(
                {
                    "month": month,
                    "planned": planned,
                    "actual": actual,
                    "percent": percent,
                }
            )

        plan_categories.append(
            {
                "category": {
                    "id": category.id,
                    "name": category.name,
                },
                "months": months,
            }
        )

    return {
        "year": year,
        "categories": plan_categories,
    }


@app.get("/budgets/status", response_model=list[schemas.BudgetStatusResponse])
def get_budget_status(
        year: int = Query(ge=2000, le=2100),
        month: int = Query(ge=1, le=12),
        db: Session = Depends(get_db),
):

    month_start = datetime(year, month, 1)

    if month == 12:
        next_month_start = datetime(year + 1, 1, 1)
    else:
        next_month_start = datetime(year, month + 1, 1)

    expense_filters = [
        models.Expense.category_id == models.Category.id,
        models.Expense.created_at >= month_start,
        models.Expense.created_at < next_month_start,
    ]

    results = (
        db.query(
            models.Category.name.label("category"),
            models.Budget.amount.label("budget"),
            func.coalesce(
                func.sum(models.Expense.amount),
                0,
            ).label("spent"),
        )
        .join(
            models.Category,
            models.Budget.category_id == models.Category.id,
        )
        .outerjoin(
            models.Expense,
            and_(*expense_filters),
        )
        .filter(
            models.Budget.year == year,
            models.Budget.month == month,
        )
        .group_by(
            models.Category.id,
            models.Category.name,
            models.Budget.amount,
        )
        .order_by(models.Category.name)
        .all()
    )

    response = []

    for row in results:
        budget = float(row.budget)
        spent = float(row.spent)
        percent = round((spent / budget) * 100, 2)

        response.append(
            {
                "category": row.category,
                "budget": budget,
                "spent": spent,
                "percent": percent,
            }
        )

    return response
