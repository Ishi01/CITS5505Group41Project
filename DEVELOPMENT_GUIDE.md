# Development Guide for CITS5505Group41Project

This guide provides detailed instructions for setting up development environment and contributing to the project.

## Setting Up Development Environment

1. Create a virtual environment:
   ```sh
   python3 -m venv venv
   ```
2. Activate the virtual environment
   Activate the virtual environment every time you start a new terminal session.

   - On Windows:

   ```
   venv\Scripts\activate
   ```

   - On MacOS/Linux:

   ```
   source venv/bin/activate
   ```

3. Installing Dependencies
   ```sh
    pip install -r requirements_macos.txt  # For macOS
   ```
     or
   ```sh
    pip install -r requirements_windows.txt  # For Windows
   ```

## Database Setup

### Creating Migrations
   
   Whenever make changes to the database models, create a migration script:
   ```sh
   flask db migrate -m "description_of_changes"
   ```
   Commit the generated migration scripts to version control system
### Applying Migrations
   When there are new migrations added to the project, apply migrations to update the database,run:
   ```sh
   flask db upgrade
   ```

### Initialsing Admin User

   First, set a local environment variable for ADMIN_PASSWORD
   ```sh
    export ADMIN_PASSWORD=your_password  # For macOS
   ```
   or
   ```sh
    set ADMIN_PASSWORD=your_password  # For Windows
   ```

   Then run:
   ```sh
    flask add-admin
   ```

   The username will be `admin` with the password set as your ADMIN_PASSWORD environment variable.

## Development Test Set Data

### Add Fake Data

Fake Leaderboard Data:
```
python add_data.py
```
Dummy Game Data:
```sh
flask add-test
```
Dummy Game Data with Admin Account:
```sh
flask add-all
```

## Testing

### Unit Tests

Unit tests can be run with the following command

```sh
python -m unittest discover -s ./tests -p "test_*.py"
```

### System Tests

Simple selenium tests can be run run using:
```sh
python -m selenium_test
```
For a full demonstration of registering an account, logging in, creating a game, playing the game, and viewing the score on the leaderboard run:
```sh
python -m selenium_test_complex
```

## Updating Requirements
Whenever you add a new dependency, update the appropriate requirements\_\*.txt file and ensure it's documented:
```
pip freeze > requirements_macos.txt  # For macOS
```
```
pip freeze > requirements_windows.txt  # For Windows
```
