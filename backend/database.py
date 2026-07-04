from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

"""
finance.db - файл базы данных
engine - подключение к БД
SessionLocal - работа с БД
Base - основа моделей
"""

DARABASE_URL = "sqlite:///./finance.db"

engine = create_engine(
    DARABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()