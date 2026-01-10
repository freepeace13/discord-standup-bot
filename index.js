require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function normalizeLines(text) {
    const t = (text ?? "").trim();
    if (!t || /^none$/i.test(t)) return "None";

    // Keep newlines, but remove leading bullet chars so users can paste freely
    const lines = t
        .split(/\r?\n/)
        .map(l => l.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean);

    return lines.length ? lines.join("\n") : "None";
}

function asCodeBlock(text) {
    // Prevent users from breaking the code block
    const safe = (text ?? "").replace(/```/g, "'''");
    // Wrap in code block to preserve formatting
    return "```text\n" + safe + "\n```";
    }

    function safeEmbedValue(value) {
    // Embed field value limit is 1024 chars
    const v = value ?? "";
    return v.length > 1024 ? v.slice(0, 1021) + "..." : v;
}

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "standup") return;

    const today = interaction.options.getString("today", true);
    const yesterday = interaction.options.getString("yesterday") ?? "None";
    const blockers = interaction.options.getString("blockers") ?? "None";

    const embed = new EmbedBuilder()
        .setTitle("Daily Dev Standup")
        .setDescription(`<@${interaction.user.id}>`)
        .addFields(
            { name: "🕘 Yesterday", value: safeEmbedValue(asCodeBlock(normalizeLines(yesterday))), inline: false },
            { name: "🚧 Blockers", value: safeEmbedValue(asCodeBlock(normalizeLines(blockers))), inline: false },
            { name: "🎯 Today", value: safeEmbedValue(asCodeBlock(normalizeLines(today))), inline: false }
        )
        .setTimestamp(new Date());

    await interaction.reply({ embeds: [embed] });
});

client.login(process.env.DISCORD_TOKEN);
