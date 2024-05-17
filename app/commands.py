import click
import json
from flask import current_app
from flask.cli import with_appcontext


@click.command('add-all')
@with_appcontext
def add_all():
    # Invoke the commands directly using the click runner
    runner = current_app.test_cli_runner()
    result_admin = runner.invoke(current_app.cli.get_command(current_app, 'add-admin'))
    result_test = runner.invoke(current_app.cli.get_command(current_app, 'add-test'))

    if result_admin.exit_code == 0:
        click.echo(result_admin.output)
    else:
        click.echo(f'Error creating admin user: {result_admin.output}')

    if result_test.exit_code == 0:
        click.echo(result_test.output)
    else:
        click.echo(f'Error adding test questions: {result_test.output}')

@click.command('add-admin')
@with_appcontext
def add_admin():
    from app.models import User, db  # Import within function to avoid import issues
    admin_email = 'admin@admin.com'
    if User.query.filter_by(email=admin_email).first() is None:
        admin_user = User(username='admin', email=admin_email, is_admin=True)
        admin_user.set_password(current_app.config['ADMIN_PASSWORD'])
        db.session.add(admin_user)
        db.session.commit()
        click.echo('Admin user created successfully.')
    else:
        click.echo('Admin user already exists.')

@click.command('add-test')
@with_appcontext
def add_test():
    from app.models import QuizQuestion, db
    if QuizQuestion.query.first() is None:
        # Data from the dictionary
        qa_dict = {
            "countries": {
                "World Geography": {
                    "description": "Vast Geographical Knowledge",
                    "user_id": 0,
                    "locations": {
                        "global": {
                            "Where is the Eiffel Tower found?": ["France"],
                            "Where is the Statue of Liberty found?": ["United States"],
                            "Where is the Taj Mahal found?": ["India"],
                            "Which countries are known for their tulip fields?": ["Netherlands", "Turkey"],
                            "Which countries are known for their pyramids?": ["Egypt", "Mexico"],
                            "What countries fought in the War of 1812?": ["United States", "United Kingdom"]
                        },
                    },
                },
                "Europe": {
                    "description": "European Quiz",
                    "user_id": 0,
                    "locations": {
                        'europe': {
                            "Which European country is home to the ancient city of Troy?": ["Turkey"],
                            "In which European Union country is the Acropolis located?": ["Greece"],
                            "Which European country has the most UNESCO World Heritage sites?": ["Italy"],
                            "Which European country was the birthplace of the Renaissance?": ["Italy"],
                            "Which two European countries are separated by the Pyrenees mountains?": ["Spain", "France"],
                            "Which European country is known for the legend of Dracula?": ["Romania"],
                            "What European country is known for the creation of the Nobel Prize?": ["Sweden"],
                            "Which European country is renowned for its historic fjords?": ["Norway"],
                            "Which European country is known for inventing the printing press?": ["Germany"],
                            "Which country is recognized for founding the first university in Europe?": ["Italy"]
                        }
                    },
                },
            },
            'elements': {
                'Periodic Table': {
                    'description': 'Test your knowledge of the periodic table.',
                    'user_id': 0,
                    'locations': {
                        'various': {
                            "Which element has the highest melting point and is used in light bulb filaments?": ["W"],  # Tungsten
                            "What is the lightest and most abundant element in the universe?": ["H"],                  # Hydrogen
                            "Which element is the best conductor of electricity and is commonly used in jewelry?": ["Ag"],  # Silver
                            "Which element is used in balloons to make them float and is also used in cryogenics?": ["He"],  # Helium
                            "What is the primary element that makes up 78% of the Earth's atmosphere?": ["N"],         # Nitrogen
                            "Which element is used in rechargeable batteries and electric vehicles?": ["Li"],          # Lithium
                            "Which element is used to purify water and also used in the production of PVC?": ["Cl"],    # Chlorine
                            "Which heavy metal is used in thermometers and also in dental amalgams?": ["Hg"],          # Mercury
                            "Which semiconductor element is essential for solar cells and computer chips?": ["Si"],    # Silicon
                            "Which element, discovered by Martin Klaproth in 1789, is used in nuclear power generation?": ["U"] # Uranium
                        },
                    },
                },
            }
        }
        # Populate the database
        for category, games in qa_dict.items():
            for game_name, game_info in games.items():
                description = game_info["description"]
                user_id = game_info["user_id"]
                for location, questions in game_info["locations"].items():
                    for question_text, answers in questions.items():
                        question = QuizQuestion(
                            category=category,
                            game_name=game_name,
                            description=description,
                            user_id=user_id,
                            question_text=question_text,
                            answer=json.dumps(answers),  # Convert list to JSON string
                            location=location
                        )
                        db.session.add(question)

        db.session.commit()
        click.echo('Loaded quiz questions into the database.')
    else:
        click.echo('Quiz questions already exist in the database.')

def register_commands(app):
    app.cli.add_command(add_all)
    app.cli.add_command(add_admin)
    app.cli.add_command(add_test)