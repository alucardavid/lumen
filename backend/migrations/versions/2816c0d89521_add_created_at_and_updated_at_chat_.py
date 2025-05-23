"""add created_at and updated_at chat_sessions

Revision ID: 2816c0d89521
Revises: 92ac98c12ef5
Create Date: 2025-04-15 11:16:33.649766

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2816c0d89521'
down_revision: Union[str, None] = '92ac98c12ef5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('chat_sessions', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('chat_sessions', sa.Column('updated_at', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('chat_sessions', 'updated_at')
    op.drop_column('chat_sessions', 'created_at')
    # ### end Alembic commands ### 