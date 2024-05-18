from flask import Blueprint, request, jsonify, render_template
from flask_login import login_required, current_user
from app import db
from app.models import QuizQuestion, User

manage = Blueprint('manage', __name__)

@login_required
@manage.route('/manage', methods=['GET'])
def manage_page():
    # Ensure the user has admin privileges
    if not current_user.is_admin:
        return jsonify({'status': 'error', 'message': 'Access denied'}), 403
    
    games = QuizQuestion.query.group_by(QuizQuestion.game_name).all()
    users = User.query.all()
    return render_template('manage.html', games=games, users=users, title='Manage')

@login_required
@manage.route('/delete_game', methods=['POST'])
def delete_game():
    game_name = request.form['game_name']
    if not current_user.is_admin:
        return jsonify({'status': 'error', 'message': 'Access denied'}), 403
    
    game = QuizQuestion.query.filter_by(game_name=game_name).first()
    if not game:
        return jsonify({'status': 'error', 'message': f'Game "{game_name}" does not exist'}), 404
    
    db.session.delete(game)
    db.session.commit()
    return jsonify({'status': 'success', 'message': f'Game "{game_name}" deleted successfully!'})

@login_required
@manage.route('/delete_user', methods=['POST'])
def delete_user():
    user_id = request.form['user_id']
    if not current_user.is_admin:
        return jsonify({'status': 'error', 'message': 'Access denied'}), 403
    
    # Prevent deletion of critical user accounts
    if user_id == '0' or User.query.get(user_id).username == 'admin':
        return jsonify({'status': 'error', 'message': 'Deleting this user is not allowed'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'User does not exist'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'status': 'success', 'message': 'User deleted successfully!'})