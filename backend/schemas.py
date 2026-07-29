from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class ExpenseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    category_id: int
    created_at: Optional[datetime] = None


class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    created_at: datetime
    category: CategoryResponse

    # позволяет превращать SQLAlchemy объект -> JSON
    # без этого FastAPI не сможет вернуть данные красиво
    # без этой строкки будет ошибка в GET
    class Config:
        from_attributes = True


class IncomeCreate(BaseModel):
    source: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    created_at: Optional[datetime] = None


class IncomeResponse(BaseModel):
    id: int
    source: str
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetCreate(BaseModel):
    category_id: int = Field(gt=0)
    amount: float = Field(gt=0)
    year: int = Field(ge=2000, le=2100)
    month: int = Field(ge=1, le=12)


class BudgetResponse(BaseModel):
    id: int
    category_id: int
    amount: float
    year: int
    month: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class BudgetStatusResponse(BaseModel):
    category: str
    budget: float
    spent: float
    percent: float
