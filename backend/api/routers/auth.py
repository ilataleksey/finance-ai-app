from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from pwdlib import PasswordHash
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from api.authentication import create_access_token, get_current_user, unauthorized

import models
import schemas
from dependencies import get_db


class AuthRoute(APIRoute):
    def get_route_handler(self):
        handler = super().get_route_handler()

        async def handle(request: Request):
            try:
                return await handler(request)
            except RequestValidationError as error:
                return JSONResponse(
                    status_code=422,
                    content={
                        "detail": [
                            {
                                "loc": item["loc"],
                                "type": item["type"],
                                "msg": "Invalid value.",
                            }
                            for item in error.errors()
                        ],
                    },
                )

        return handle


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    route_class=AuthRoute,
)

password_hasher = PasswordHash.recommended()
DUMMY_PASSWORD_HASH = password_hasher.hash("unused-login-placeholder")


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register_user(
    payload: schemas.UserRegister,
    db: Session = Depends(get_db),
):
    email = str(payload.email).lower()

    if len(email) > 254:
        raise HTTPException(status_code=422, detail="Email is too long")

    existing_user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if existing_user is not None:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = models.User(
        email=email,
        password_hash=password_hasher.hash(
            payload.password.get_secret_value()
        ),
    )

    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        existing_user = db.query(models.User).filter(
            models.User.email == email
        ).first()

        if existing_user is not None:
            raise HTTPException(
                status_code=409,
                detail="Email already registered",
            )

        raise

    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(
    payload: schemas.UserLogin,
    db: Session = Depends(get_db),
):
    email = str(payload.email).lower()

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    stored_hash = user.password_hash if user is not None else DUMMY_PASSWORD_HASH
    password_is_valid = password_hasher.verify(
        payload.password.get_secret_value(),
        stored_hash,
    )

    if user is None or not password_is_valid:
        raise unauthorized()

    return schemas.TokenResponse(
        access_token=create_access_token(user.id),
    )


@router.get("/me", response_model=schemas.UserResponse)
def read_current_user(
    user: models.User = Depends(get_current_user),
):
    return user