"""add created_at and updated_at chat_message

Revision ID: 92ac98c12ef5
Revises: d3f0f7d1f1e2
Create Date: 2025-04-15 11:12:11.363141

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '92ac98c12ef5'
down_revision: Union[str, None] = 'd3f0f7d1f1e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('chat_messages', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('chat_messages', sa.Column('updated_at', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('chat_messages', 'updated_at')
    op.drop_column('chat_messages', 'created_at')
    # ### end Alembic commands ### 