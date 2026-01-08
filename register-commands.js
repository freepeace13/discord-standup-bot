require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const standup = new SlashCommandBuilder()
    .setName("standup")
    .setDescription("Post your daily dev update (Yesterday/Blockers/Today)")
    .addStringOption(opt =>
        opt
            .setName("today")
            .setDescription("What you will work on today")
            .setRequired(true)
    )
    .addStringOption(opt =>
        opt
            .setName("yesterday")
            .setDescription("What you worked on yesterday (optional)")
            .setRequired(false)
    )
    .addStringOption(opt =>
        opt
            .setName("blockers")
            .setDescription('What is blocking you (optional, use "None" if no blockers)')
            .setRequired(false)
    );

const commands = [standup.toJSON()];

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
    );
    console.log("✅ Registered /standup (Today required; Yesterday/Blockers optional)");
})();