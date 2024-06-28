import discohook


@discohook.command.slash(
    name="hello",
    description="Say Hello"
)
async def hello_command(interaction: discohook.Interaction):
    username = interaction.author.global_name
    await interaction.response.send(
        f"Hello, {username}!"
    )
