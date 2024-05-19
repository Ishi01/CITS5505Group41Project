# app_server.py
from sqlalchemy import text
from config import TestConfig, Config

from app import create_app, db
from flask_migrate import upgrade



### Some sort of database multithreading is causing the database not to be removed
### And sometimes the tests fail because the information already exists.


def run_server():
    db.drop_all
    app = create_app(Config)
    with app.app_context():
        db.session.remove()
        # Connect to the database and drop the view if it exists
        with db.engine.connect() as connection:
            connection.execute(text('DROP VIEW IF EXISTS game_leaderboard'))
            connection.execute(text('DROP TABLE IF EXISTS alembic_version'))
            connection.execute(text('DROP TABLE IF EXISTS sessions'))
        # Now attempt to drop all tables
        db.drop_all()
        db.engine.dispose()

        upgrade()  # Apply database migrations within the app context
        app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

if __name__ == '__main__':
    run_server()