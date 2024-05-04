from flask import Flask, jsonify, render_template, request, current_app
import random
import os
from app import app, db
from app.forms import LoginForm, RegistrationForm
from flask import flash, redirect, url_for
from flask_login import current_user, login_user, logout_user, login_required
import sqlalchemy as sa
from app.models import User
from urllib.parse import urlsplit


@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html', title='Home')

qa_dict = {
    'countries': {
        "Where is the Eiffel Tower found?": "France",
        "Where is the Statue of Liberty found?": "United States",
        "Where is the Taj Mahal found?": "India"
    },
    'elements': {
        "Which element has the highest melting point and is used in light bulb filaments?": "W",  # Tungsten
        "What is the lightest and most abundant element in the universe?": "H",                  # Hydrogen
        "Which element is the best conductor of electricity and is commonly used in jewelry?": "Ag",  # Silver
        "Which element is used in balloons to make them float and is also used in cryogenics?": "He",  # Helium
        "What is the primary element that makes up 78% of the Earth's atmosphere?": "N",         # Nitrogen
        "Which element is used in rechargeable batteries and electric vehicles?": "Li",          # Lithium
        "Which element is used to purify water and also used in the production of PVC?": "Cl",    # Chlorine
        "Which heavy metal is used in thermometers and also in dental amalgams?": "Hg",          # Mercury
        "Which semiconductor element is essential for solar cells and computer chips?": "Si",    # Silicon
        "Which element, discovered by Martin Klaproth in 1789, is used in nuclear power generation?": "U" # Uranium
    }
}

@app.route('/get-random-qa')
def get_random_qa():
    referer_url = request.headers.get('Referer')
    print(request.headers)
    if 'index' in referer_url:
        category = 'countries'
    elif 'world' in referer_url:
        category = 'countries'
    elif 'periodictable' in referer_url:
        category = 'elements'
    else:
        return jsonify(error="Unable to determine the category from the referer"), 400
    subdict = qa_dict[category]
    question, answer = random.choice(list(subdict.items()))
    return jsonify(question=question)

@app.route('/check-answer', methods=['POST'])
def check_answer():
    data = request.json

    referer_url = request.headers.get('Referer')
    if 'index' in referer_url:
        category = 'countries'
    elif 'world' in referer_url:
        category = 'countries'
    elif 'periodictable' in referer_url:
        category = 'elements'
    else:
        return jsonify(error="Unable to determine the category from the referer"), 400
    
    user_answer = data['answer']
    question = data['question']

    correct_answer = qa_dict[category][question]
    is_correct = (user_answer.strip().lower() == correct_answer.strip().lower())
    return jsonify(is_correct=is_correct)

@app.route('/periodictable')
def periodic_table():
    svg_path = os.path.join(current_app.root_path, 'static', 'pt.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()
    return render_template('periodic_table.html', svg_content=svg_content)

@app.route('/world')
# @login_required
def world():
    svg_path = os.path.join(current_app.root_path, 'static', 'world.svg')
    with open(svg_path, 'r') as file:
        svg_content = file.read()
    return render_template('world.html', svg_content=svg_content)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = db.session.scalar(
            sa.select(User).where(User.username == form.username.data))
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password,please try again.')
            flash('If you are a new user, please register first.')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        next_page = request.args.get('next')
        if not next_page or urlsplit(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template('login.html', title='Sign In', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)