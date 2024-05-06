"""Modify quiz_questions table

Revision ID: 8f619e579423
Revises: 907b125de262
Create Date: 2024-05-06 14:58:45.278616
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = '8f619e579423'
down_revision = '907b125de262'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('quiz_questions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('location', sa.String(length=100), nullable=True))
        batch_op.alter_column('answer', type_=sa.ARRAY, nullable=False)

def downgrade():
    with op.batch_alter_table('quiz_questions', schema=None) as batch_op:
        batch_op.alter_column('answer', type_=sa.String(length=200), nullable=False)
        batch_op.drop_column('location')