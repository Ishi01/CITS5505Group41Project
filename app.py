import sqlalchemy as sa
import sqlalchemy.orm as so
from app import app, db
from app.models import User, Game



@app.shell_context_processor
def make_shell_context():
    print("Shell context processor is being used!")
    return {'sa': sa, 'so': so, 'db': db, 'User': User, 'Game': Game}


if __name__ == '__main__':
    print("App is running! on debug mode!")
    app.run(debug=True)