"""create quiz_questions table

Revision ID: 907b125de262
Revises: 0c70156044eb
Create Date: 2024-05-02 19:26:50.130958

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '907b125de262'
down_revision = '0c70156044eb'
branch_labels = None
depends_on = None


def upgrade():
    # Create quiz_questions table
    op.create_table(
        'quiz_questions',
        sa.Column('question_id', sa.Integer, primary_key=True, nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('question_text', sa.String(length=200), nullable=False),
        sa.Column('answer', sa.String(length=200), nullable=False)
    )


def downgrade():
    # Drop quiz_questions table
    op.drop_table('quiz_questions')
