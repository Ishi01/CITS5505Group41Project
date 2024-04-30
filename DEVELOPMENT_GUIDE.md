# Development Guide for CITS5505Group41Project

This guide provides detailed instructions for setting up development environment and contributing to the project.

## Setting Up Development Environment


1. Create a virtual environment:
   ```
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
   ```
    pip install -r requirements_macos.txt  # For macOS
    ```
     or
    ```
    pip install -r requirements_windows.txt  # For Windows
   ```

## Database Setup


  
### Creating Migrations
   
   Whenever make changes to the database models, create a migration script:
   ```
   flask db migrate -m "description_of_changes"
   ```
   Commit the generated migration scripts to version control system
### Applying Migrations
   When there are new migrations added to the project, apply migrations to update the database,run:
   ```
   flask db upgrade
   ```


## Testing
## Updating Requirements
Whenever you add a new dependency, update the appropriate requirements_*.txt file and ensure it's documented:
```
pip freeze > requirements_macos.txt  # For macOS
```
```
pip freeze > requirements_windows.txt  # For Windows
```