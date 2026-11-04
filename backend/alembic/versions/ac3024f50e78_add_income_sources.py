"""add income sources

Revision ID: ac3024f50e78
Revises: 63b92725dc3b
Create Date: 2026-11-04 19:25:56.885972

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ac3024f50e78'
down_revision: Union[str, Sequence[str], None] = '63b92725dc3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "income_sources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("normalized_name", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "normalized_name",
            name="uq_income_sources_normalized_name",
        ),
    )


def downgrade() -> None:
    op.drop_table("income_sources")
