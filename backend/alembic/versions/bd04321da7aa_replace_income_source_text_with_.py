"""replace income source text with reference

Revision ID: bd04321da7aa
Revises: ac3024f50e78
Create Date: 2026-11-04 20:48:09.281787

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bd04321da7aa'
down_revision: Union[str, Sequence[str], None] = 'ac3024f50e78'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()

    count = connection.execute(
        sa.text("SELECT COUNT(*) FROM incomes")
    ).scalar_one()

    if count != 0:
        raise RuntimeError(
            "This development migration requires an empty incomes table."
        )

    with op.batch_alter_table("incomes") as batch_op:
        batch_op.add_column(
            sa.Column("source_id", sa.Integer(), nullable=False)
        )

        batch_op.create_foreign_key(
            "fk_incomes_source_id_income_sources",
            "income_sources",
            ["source_id"],
            ["id"],
        )

        batch_op.drop_column("source")


def downgrade() -> None:
    with op.batch_alter_table("incomes") as batch_op:
        batch_op.add_column(
            sa.Column("source", sa.String(), nullable=True)
        )

        batch_op.drop_constraint(
            "fk_incomes_source_id_income_sources",
            type_="foreignkey",
        )

        batch_op.drop_column("source_id")
