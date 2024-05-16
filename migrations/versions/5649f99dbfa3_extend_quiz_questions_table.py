"""Extend Quiz Questions Table

Revision ID: 5649f99dbfa3
Revises: 8f619e579423
Create Date: 2024-05-10 21:52:43.448625

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5649f99dbfa3'
down_revision = '8f619e579423'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('quiz_questions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('game_name', sa.String(length=100), nullable=False))
        batch_op.add_column(sa.Column('description', sa.String(length=255), nullable=False))
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=False))
        batch_op.create_foreign_key('fk_quiz_questions_users', 'user', ['user_id'], ['id'])

def downgrade():
    with op.batch_alter_table('quiz_questions', schema=None) as batch_op:
        batch_op.drop_column('game_name')
        batch_op.drop_column('description')
        batch_op.drop_constraint('fk_quiz_questions_users', type_='foreignkey')
        batch_op.drop_column('user_id')

    op.create_table('quiz_question',
    sa.Column('question_id', sa.INTEGER(), nullable=False),
    sa.Column('category', sa.VARCHAR(length=50), nullable=False),
    sa.Column('question_text', sa.VARCHAR(length=200), nullable=False),
    sa.Column('answer', sa.VARCHAR(length=200), nullable=False),
    sa.PrimaryKeyConstraint('question_id')
    )
    # ### end Alembic commands ###
