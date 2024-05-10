import json
from app import db
from app.models import QuizQuestion
from flask.cli import with_appcontext

@with_appcontext
def load_quiz_questions():
    # Check if any data already exists in the database
    if QuizQuestion.query.first() is None:
        # Data from the dictionary
        qa_dict = {
            'countries': {
                'global': {
                    "Where is the Eiffel Tower found?": ["France"],
                    "Where is the Statue of Liberty found?": ["United States"],
                    "Where is the Taj Mahal found?": ["India"],
                    "Which countries are known for their tulip fields?": ["Netherlands", "Turkey"],
                    "Which countries are known for their pyramids?": ["Egypt", "Mexico"],
                    "What countries fought in the War of 1812?": ["United States", "United Kingdom"]
                },
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
            'elements': {
                'Various': {
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
                }
            }
        }

        # Populate the database
        for category, locations in qa_dict.items():
            for location, questions in locations.items():
                for question_text, answers in questions.items():
                    question = QuizQuestion(
                        category=category,
                        question_text=question_text,
                        location=location,
                        answer=json.dumps(answers)  # Convert list to JSON string
                    )
                    print(location)
                    db.session.add(question)

        db.session.commit()