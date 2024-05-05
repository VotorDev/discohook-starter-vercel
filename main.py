import os

import aiohttp
import asyncio

from starlette.requests import Request
from starlette.responses import JSONResponse
from starlette.middleware import Middleware
from starlette.staticfiles import StaticFiles

import discohook
from discohook.middleware import SingleUseSessionMiddleware

from storage import Storage

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
    middleware=[Middleware(SingleUseSessionMiddleware)],
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

@app.load
@discohook.command.slash(
    name="test",
    description="test command"
)
async def test_command(interaction: discohook.Interaction):
    username = interaction.author.global_name
    await interaction.response.defer()
    await asyncio.sleep(8)
    await interaction.response.followup(str(id(asyncio.get_running_loop())))

@app.load
@discohook.command.slash(
    name="test-set",
    description="test set command",
    options=[
            discohook.Option.string(
                name="value",
                required=True,
                description="Value to set",
            ),
        ]
    )
async def test_set_command(interaction: discohook.Interaction, value:str):
    username = interaction.author.global_name
    DB = Storage.client("testDB")
    DB.set(value, key=interaction.author.id)
    await interaction.response.send(f"{username} has set value={value}")

@app.load
@discohook.command.slash(
    name="test-get",
    description="test get command"
    )
async def test_set_command(interaction: discohook.Interaction):
    username = interaction.author.global_name
    DB = Storage.client("testDB")
    value = DB.get(key=interaction.author.id)
    await interaction.response.send(f"{username} has retrieved value={value}")

async def index(request: Request):
    return JSONResponse({"success": True}, status_code=200)

app.mount('/', app=StaticFiles(directory='static'), name="static")

#app.add_route("/", index, methods=["GET"], include_in_schema=False)
