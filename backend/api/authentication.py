import os
from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

import models
from dependencies import get_db


JWT_SECRET = os.environ.get("FINANCE_APP_JWT_SECRET", "")
if len(JWT_SECRET.encode("utf-8")) < 32:
    raise RuntimeError(
        "Set FINANCE_APP_JWT_SECRET before starting the backend."
    )

JWT_ALGORITHM = "HS256"
TOKEN_LIFETIME = timedelta(minutes=30)

bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: int) -> str:
    return jwt.encode(
        {
            "sub": str(user_id),
            "exp": datetime.now(UTC) + TOKEN_LIFETIME,
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def unauthorized() -> HTTPException:
    return HTTPException(
        status_code=401,
        detail="Could not authenticate",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    if credentials is None:
        raise unauthorized()

    try:
        payload = jwt.decode(
            credentials.credentials,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["sub", "exp"]},
        )
        user_id = int(payload["sub"])
    except (jwt.InvalidTokenError, ValueError, TypeError):
        raise unauthorized() from None

    user = db.get(models.User, user_id)

    if user is None:
        raise unauthorized()

    return user