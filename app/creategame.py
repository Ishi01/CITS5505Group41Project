import json
import os
import time

import sqlalchemy as sa
from flask import (
    Blueprint,
    current_app,
    jsonify,
    render_template,
    request,
    session,
)
from app.models import QuizQuestion
from flask_session import Session


creategame = Blueprint('creategame', __name__)

@creategame.route('/creategame')
def loadpage():
    return render_template('creategame.html')

