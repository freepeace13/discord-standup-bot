require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function normalizeLines(text) {
  const t = (text ?? "").trim();
  if (!t || /^none$/i.test(t)) return "None";

  // Keep newlines; remove leading bullet chars if user pasted them
  const lines = t
    .split(/\r?\n/)
    .map(l => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  return lines.length ? lines.join("\n") : "None";
}

function asCodeBlock(text) {
  // Prevent breaking out of code block
  const safe = (text ?? "").replace(/```/g, "'''");
  return `\`\`\`text\n${safe}\n\`\`\``;
}

function limit1024(str) {
  return str.length > 1024 ? str.slice(0, 1021) + "..." : str;
}

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  // 1) Slash command => show modal
  if (interaction.isChatInputCommand() && interaction.commandName === "standup") {
    const modal = new ModalBuilder()
      .setCustomId("standup_modal")
      .setTitle("Daily Dev Standup");

    const yesterdayInput = new TextInputBuilder()
      .setCustomId("yesterday")
      .setLabel("Yesterday (optional)")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setPlaceholder("What did you work on last session?\n- Fix bug #123\n- Review PR #45");

    const blockersInput = new TextInputBuilder()
      .setCustomId("blockers")
      .setLabel('Blockers (optional, type "None" if none)')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setPlaceholder("Anything blocking you?\n- Waiting for staging access");

    const todayInput = new TextInputBuilder()
      .setCustomId("today")
      .setLabel("Today (required)")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder("What will you work on today?\n- Implement feature X\n- Add tests");

    modal.addComponents(
      new ActionRowBuilder().addComponents(yesterdayInput),
      new ActionRowBuilder().addComponents(blockersInput),
      new ActionRowBuilder().addComponents(todayInput)
    );

    return interaction.showModal(modal);
  }

  // 2) Modal submit => post formatted embed
  if (interaction.isModalSubmit() && interaction.customId === "standup_modal") {
    const yesterday = interaction.fields.getTextInputValue("yesterday") || "None";
    const blockers = interaction.fields.getTextInputValue("blockers") || "None";
    const today = interaction.fields.getTextInputValue("today"); // required by modal

    const embed = new EmbedBuilder()
      .setTitle("Daily Dev Standup")
      .setDescription(`<@${interaction.user.id}>`)
      .addFields(
        { name: "🕘 Yesterday", value: limit1024(asCodeBlock(normalizeLines(yesterday))), inline: false },
        { name: "🚧 Blockers", value: limit1024(asCodeBlock(normalizeLines(blockers))), inline: false },
        { name: "🎯 Today", value: limit1024(asCodeBlock(normalizeLines(today))), inline: false }
      )
      .setTimestamp(new Date());

    return interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
