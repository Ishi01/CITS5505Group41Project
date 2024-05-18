"""feedback_and_game_restructure

Revision ID: 43e4b592987f
Revises: fe50100af5ce
Create Date: 2024-05-17 16:38:04.892463

"""
from sqlalchemy.sql import func
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '43e4b592987f'
down_revision = 'fe50100af5ce'
branch_labels = None
depends_on = None

def upgrade():
    # Modify the existing game table
    with op.batch_alter_table('game', schema=None) as batch_op:
        batch_op.drop_index('ix_game_timestamp')
        batch_op.drop_column('result')
        batch_op.drop_column('timestamp')
        batch_op.drop_column('id')
        batch_op.add_column(sa.Column('game_name', sa.String(length=100), primary_key=True, nullable=False))
        batch_op.add_column(sa.Column('description', sa.String(length=200), nullable=True))
        batch_op.add_column(sa.Column('category', sa.String(length=50), nullable=False))

    # Create the feedback table
    op.create_table('feedback',
        sa.Column('game_name', sa.String(length=100), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('feedback', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['game_name'], ['game.game_name']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.PrimaryKeyConstraint('game_name', 'user_id')
    )
    # ### end Alembic commands ###

def downgrade():
    # Drop the feedback table
    op.drop_table('feedback')
    
    # Revert changes to the game table
    with op.batch_alter_table('game', schema=None) as batch_op:
        batch_op.drop_column('game_name')
        batch_op.drop_column('description')
        batch_op.drop_column('category')
        batch_op.add_column(sa.Column('result', sa.Integer(), nullable=False))
        batch_op.add_column(sa.Column('timestamp', sa.DateTime(), nullable=False))
        batch_op.add_column(sa.Column('id', sa.Integer(), nullable=False, primary_key=True))
        batch_op.create_index(batch_op.f('ix_game_timestamp'), ['timestamp'], unique=False)

    # ### end Alembic commands ###