from app import app
from cmd_hello import hello_command


app.add_commands(
    hello_command
)
