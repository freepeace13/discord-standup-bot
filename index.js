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
  
  🕘 **Yesterday:**
  ${formatList(yesterday)}
  
  🚧 **Blockers:**
  ${formatList(blockers)}
  
  🎯 **Today:**
  ${formatList(today)}
  `
    );
}

client.once("clientReady", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "standup") return;

    try {
        // ✅ Acknowledge immediately (prevents 10062)
        await interaction.deferReply(); // default is public

        const today = interaction.options.getString("today", true);
        const yesterday = interaction.options.getString("yesterday") ?? "None";
        const blockers = interaction.options.getString("blockers") ?? "None";

        const message = formatStandup({
            today,
            yesterday,
            blockers,
            userId: interaction.user.id,
        });

        // ✅ Send final content after processing
        await interaction.editReply({ content: message });
    } catch (err) {
        console.error("Standup command error:", err);

        // If deferReply already happened, editReply; otherwise reply safely
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({
                content: "⚠️ Something went wrong while posting your standup. Please try again.",
            }).catch(() => { });
        } else {
            await interaction.reply({
                content: "⚠️ Something went wrong while posting your standup. Please try again.",
                // (no ephemeral to avoid the deprecation warning)
            }).catch(() => { });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});
