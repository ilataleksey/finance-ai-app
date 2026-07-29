"""make budgets monthly

Revision ID: d8148c7e9359
Revises: cceb33de3e29
Create Date: 2026-07-29 22:10:52.065034

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8148c7e9359'
down_revision: Union[str, Sequence[str], None] = 'cceb33de3e29'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("DELETE FROM budgets WHERE id = 1")

    naming_convention = {
        "uq": "uq_%(table_name)s_%(column_0_name)s",
    }

    with op.batch_alter_table(
        "budgets",
        recreate="always",
        naming_convention=naming_convention,
    ) as batch_op:
        batch_op.drop_constraint(
            "uq_budgets_category_id",
            type_="unique",
        )
        batch_op.alter_column(
            "category_id",
            existing_type=sa.Integer(),
            nullable=False,
        )
        batch_op.alter_column(
            "year",
            existing_type=sa.VARCHAR(),
            type_=sa.Integer(),
            nullable=False,
        )
        batch_op.alter_column(
            "month",
            existing_type=sa.VARCHAR(),
            type_=sa.Integer(),
            nullable=False,
        )
        batch_op.alter_column(
            "created_at",
            existing_type=sa.DateTime(),
            nullable=False,
        )
        batch_op.create_unique_constraint(
            "uq_budget_category_period",
            ["category_id", "year", "month"],
        )


def downgrade() -> None:
    raise NotImplementedError(
        "Downgrade would discard monthly budget data and is intentionally disabled."
    )
