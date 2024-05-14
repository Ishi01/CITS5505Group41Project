"""Add is_admin to User

Revision ID: 2633c2d1b330
Revises: 5649f99dbfa3
Create Date: 2024-05-14 21:37:36.998880

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2633c2d1b330'
down_revision = '5649f99dbfa3'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.text('false')))

def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('is_admin')
