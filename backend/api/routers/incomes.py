from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from dependencies import get_db


router = APIRouter(
    prefix="/incomes",
    tags=["incomes"],
)

@router.post("", response_model=schemas.IncomeResponse)
def create_income(
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db),
):
    source = db.query(models.IncomeSource).filter(
        models.IncomeSource.id == income.source_id
    ).first()

    if source is None:
        raise HTTPException(
            status_code=404,
            detail="Income source not found",
        )

    db_income = models.Income(
        source_id=source.id,
        amount=income.amount,
        created_at=income.created_at or datetime.now(UTC),
    )

    db.add(db_income)
    db.commit()
    db.refresh(db_income)

    return db_income


@router.get("", response_model=list[schemas.IncomeResponse])
def get_incomes(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Income)

    if start_date:
        query = query.filter(
            models.Income.created_at >= start_date
        )

    if end_date:
        next_day_start = datetime.combine(
            end_date.date() + timedelta(days=1),
            datetime.min.time(),
        )

        query = query.filter(
            models.Income.created_at < next_day_start
        )

    return query.order_by(
        models.Income.created_at.desc(),
        models.Income.id.desc(),
    ).all()


@router.put("/{income_id}", response_model=schemas.IncomeResponse)
def update_income(
    income_id: int,
    income: schemas.IncomeUpdate,
    db: Session = Depends(get_db),
):
    db_income = db.query(models.Income).filter(
        models.Income.id == income_id
    ).first()

    if db_income is None:
        raise HTTPException(
            status_code=404,
            detail="Income not found",
        )

    source = db.query(models.IncomeSource).filter(
        models.IncomeSource.id == income.source_id
    ).first()

    if source is None:
        raise HTTPException(
            status_code=404,
            detail="Income source not found",
        )

    db_income.source = source
    db_income.amount = income.amount
    db_income.created_at = income.created_at

    db.commit()
    db.refresh(db_income)

    return db_income


@router.delete("/{income_id}", status_code=204)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
):
    income = db.query(models.Income).filter(
        models.Income.id == income_id
    ).first()

    if income is None:
        raise HTTPException(
            status_code=404,
            detail="Income not found",
        )

    db.delete(income)
    db.commit()