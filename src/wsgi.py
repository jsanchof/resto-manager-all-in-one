# This file was created to run the application on heroku using gunicorn.
# Read more about it:https://devcenter.heroku.com/articles/python-gunicorn

from app import create_app

application = create_app()

if __name__ == "__main__":
    application.run()
