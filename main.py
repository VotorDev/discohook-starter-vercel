import os

import aiohttp

from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.middleware import Middleware
from starlette.middleware.base import BaseHTTPMiddleware

import discohook

APPLICATION_ID = os.getenv("DISCORD_APP_ID")
APPLICATION_TOKEN = os.getenv("DISCORD_APP_TOKEN")
APPLICATION_PUBLIC_KEY = os.getenv("DISCORD_APP_PUBLIC_KEY")
APPLICATION_PASSWORD = os.getenv("DISCORD_APP_PASSWORD")


app = discohook.Client(
    application_id=APPLICATION_ID,
    token=APPLICATION_TOKEN,
    public_key=APPLICATION_PUBLIC_KEY,
    password=APPLICATION_PASSWORD,
    default_help_command=True,
)


@app.load
@discohook.command.slash(
    name="hello",
    description="Say Hello"
)
async def beep_command(interaction: discohook.Interaction):
    username = interaction.author.global_name
    await interaction.response.send(
        f"Hello, {username}!"
    )


async def index(request: Request):
    return JSONResponse({"success": True}, status_code=200)

app.add_route("/", index, methods=["GET"], include_in_schema=False)
