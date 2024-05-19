from app.routes import main
from app.worldmap import worldmap
from app.creategame import creategame
from app.periodictable import periodictable
from app.manage import manage
from app.user import user

def register_blueprints(app):
    app.register_blueprint(main)
    app.register_blueprint(worldmap)
    app.register_blueprint(creategame)
    app.register_blueprint(periodictable)
    app.register_blueprint(manage)
    app.register_blueprint(user)