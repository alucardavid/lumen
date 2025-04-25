"""add user session limits

Revision ID: add_session_limits
Revises: 2816c0d89521
Create Date: 2024-04-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_session_limits'
down_revision = '2816c0d89521'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add columns to users table
    op.add_column('users', sa.Column('available_sessions', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('users', sa.Column('used_sessions', sa.Integer(), nullable=False, server_default='0'))

def downgrade() -> None:
    op.drop_column('users', 'used_sessions')
    op.drop_column('users', 'available_sessions') 