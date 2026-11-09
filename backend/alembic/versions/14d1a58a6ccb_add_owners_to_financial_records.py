"""add owners to financial records

Revision ID: 14d1a58a6ccb
Revises: bb0abf4b5554
Create Date: 2026-11-09 23:18:28.994968

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '14d1a58a6ccb'
down_revision: Union[str, Sequence[str], None] = 'bb0abf4b5554'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


OWNED_TABLES = (
    "categories",
    "expenses",
    "income_sources",
    "incomes",
    "budgets",
)


def upgrade() -> None:
    for table in OWNED_TABLES:
        with op.batch_alter_table(table) as batch_op:
            batch_op.add_column(
                sa.Column("user_id", sa.Integer(), nullable=True),
            )
            batch_op.create_foreign_key(
                f"fk_{table}_user_id_users",
                "users",
                ["user_id"],
                ["id"],
            )
            batch_op.create_index(f"ix_{table}_user_id", ["user_id"])


def downgrade() -> None:
    for table in reversed(OWNED_TABLES):
        with op.batch_alter_table(table) as batch_op:
            batch_op.drop_index(f"ix_{table}_user_id")
            batch_op.drop_constraint(
                f"fk_{table}_user_id_users",
                type_="foreignkey",
            )
            batch_op.drop_column("user_id")
    