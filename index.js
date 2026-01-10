require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

function normalizeToBullets(text) {
  const t = (text ?? "").trim();
  if (!t || /^none$/i.test(t)) return "None";

  // Split lines, remove any existing bullets, then re-bullet
  const lines = t
    .split("\n")
    .map(l => l.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean);

  // Use a non-markdown bullet character (still nice in embeds)
  return lines.map(l => `• ${l}`).join("\n");
}

function safeEmbedValue(value) {
  // Discord embed field values must be <= 1024 chars
  // Also prevent accidental code blocks breaking formatting
  const v = (value ?? "").replace(/```/g, "'''");
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
      { name: "🕘 Yesterday", value: safeEmbedValue(normalizeToBullets(yesterday)), inline: false },
      { name: "🚧 Blockers", value: safeEmbedValue(normalizeToBullets(blockers)), inline: false },
      { name: "🎯 Today", value: safeEmbedValue(normalizeToBullets(today)), inline: false }
    )
    .setTimestamp(new Date());

  await interaction.reply({ embeds: [embed] });
});

client.login(process.env.DISCORD_TOKEN);
