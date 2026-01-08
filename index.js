require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

function formatList(text) {
    const t = (text ?? "").trim();

    if (!t || /^none$/i.test(t)) return "- None";

    const lines = t.split("\n").map(l => l.trim()).filter(Boolean);

    if (lines.length > 1) {
        return lines
            .map(l => (l.startsWith("-") || l.startsWith("•") ? l : `- ${l}`))
            .join("\n");
    }

    return t.startsWith("-") || t.startsWith("•") ? t : `- ${t}`;
}

function formatStandup({ today, yesterday, blockers, userId }) {
    return (
        `🧑‍💻 <@${userId}> — **Daily Dev Standup**

📝 _Quick async update to share progress, blockers, and focus for today._

🕘 **Yesterday:**
${formatList(yesterday)}

🚧 **Blockers:**
${formatList(blockers)}

🎯 **Today:**
${formatList(today)}
`
    );
}

client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "standup") return;

    const today = interaction.options.getString("today", true);
    const yesterday = interaction.options.getString("yesterday") ?? "None";
    const blockers = interaction.options.getString("blockers") ?? "None";

    const message = formatStandup({
        today,
        yesterday,
        blockers,
        userId: interaction.user.id,
    });

    await interaction.reply({
        content: message,
        ephemeral: false,
    });
});

client.login(process.env.DISCORD_TOKEN);
