from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
import schemas
from dependencies import get_db


router = APIRouter(
    prefix="/income-sources",
    tags=["income sources"],
)


@router.get("", response_model=list[schemas.IncomeSourceResponse])
def get_income_sources(
    db: Session = Depends(get_db),
):
    return db.query(models.IncomeSource).order_by(
        models.IncomeSource.normalized_name,
        models.IncomeSource.id,
    ).all()


@router.post(
    "",
    response_model=schemas.IncomeSourceResponse,
    status_code=201,
)
def create_income_source(
    source: schemas.IncomeSourceCreate,
    db: Session = Depends(get_db),
):
    normalized_name = source.name.casefold()

    existing = db.query(models.IncomeSource).filter(
        models.IncomeSource.normalized_name == normalized_name
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Income source already exists",
        )

    db_source = models.IncomeSource(
        name=source.name,
        normalized_name=normalized_name,
    )

    db.add(db_source)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Income source already exists",
        )

    db.refresh(db_source)

    return db_source