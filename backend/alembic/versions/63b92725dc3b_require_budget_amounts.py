"""require budget amounts

Revision ID: 63b92725dc3b
Revises: d8148c7e9359
Create Date: 2026-07-29 22:26:42.980613

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '63b92725dc3b'
down_revision: Union[str, Sequence[str], None] = 'd8148c7e9359'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table(
        "budgets",
        recreate="always",
    ) as batch_op:
        batch_op.alter_column(
            "amount",
            existing_type=sa.Float(),
            nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table(
        "budgets",
        recreate="always",
    ) as batch_op:
        batch_op.alter_column(
            "amount",
            existing_type=sa.Float(),
            nullable=True,
        )
