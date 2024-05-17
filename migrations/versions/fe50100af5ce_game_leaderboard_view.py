"""game_leaderboard_view

Revision ID: fe50100af5ce
Revises: 2633c2d1b330
Create Date: 2024-05-17 13:53:45.967664

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fe50100af5ce'
down_revision = '2633c2d1b330'
branch_labels = None
depends_on = None

def upgrade():
    # Create the game_leaderboard view
    op.execute("""
    CREATE VIEW game_leaderboard AS
    WITH ranked_scores AS (
        SELECT
            ugh.user_id,
            u.username,
            ugh.game_name,
            ugh.correct_answers,
            ugh.attempts,
            ugh.completion_time,
            ROW_NUMBER() OVER (
                PARTITION BY ugh.user_id, ugh.game_name
                ORDER BY ugh.correct_answers DESC, ugh.attempts ASC, ugh.completion_time ASC
            ) as rank
        FROM
            user_game_history ugh
        JOIN
            user u ON ugh.user_id = u.id
    )
    SELECT
        user_id,
        username,
        game_name,
        correct_answers,
        attempts,
        completion_time
    FROM
        ranked_scores
    WHERE
        rank = 1
    ORDER BY
        game_name, correct_answers DESC, attempts ASC, completion_time ASC;
    """)

def downgrade():
    # Drop the game_leaderboard view
    op.execute("DROP VIEW IF EXISTS game_leaderboard")