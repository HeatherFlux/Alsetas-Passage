/**
 * Utility functions for Discord message formatting and handling
 */

/**
 * Removes timestamp prefix from history messages
 * @param {string} history - The history message
 * @returns {string} History without timestamp prefix
 */
function removePrefix(history) {
    return history.replace(/\d{1,2}:\d{2}:\d{2} (AM|PM) Your /, '');
}

/**
 * Parses dice roll history and formats it for Discord
 * @param {string} history - The dice roll history
 * @param {string} title - The roll title
 * @param {string} characterName - The character's name
 * @returns {string} Formatted Discord message
 */
function parseDiceHistory(history, title, characterName = "Unknown Character") {
    history = removePrefix(history);
    const parts = history.split(" ");

    // Handle single-word history
    if (parts.length === 1) return history;

    const rollType = parts[0];
    const rollValue = parts.find(part => /^\d+$/.test(part)) || "10"; // Find first numeric value

    const messageTemplates = {
        Critical: `Critical Hit! **${characterName}'s** ${title} caused **${rollValue}** damage.`,
        Attack: `**${characterName}'s** ${title} attempts to hit with a **${rollValue}**.`,
        Damage: `**${characterName}'s** ${title} caused **${rollValue}** damage.`,
        Free: `**${characterName}** rolls ${rollValue} with advantage`,
        default: `**${characterName}** rolls ${title} for **${rollValue}**.`
    };

    return messageTemplates[rollType] || messageTemplates.default;
}

/**
 * Prepares a message for Discord with proper formatting
 * @param {string} title - The message title
 * @param {string} traits - Character traits
 * @param {string} contentMarkdown - The main content in markdown format
 * @returns {string} Formatted Discord message
 */
function prepareMessage(title, traits, contentMarkdown) {
    const lines = contentMarkdown.split('\n').map(line => `> ${line}`).join('\n');
    return traits
        ? `**${title}**\n> **Traits:** ${traits}\n${lines}`
        : `**${title}**\n${lines}`;
}

/**
 * Creates the request body for Discord webhook
 * @param {string} message - The message to send
 * @param {string} avatarUrl - URL for the webhook avatar
 * @returns {Object} Formatted request body
 */
function createWebhookBody(message, avatarUrl = "https://i.imgur.com/xi6Qssm.png") {
    return {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            avatar_url: avatarUrl,
            content: message,
        }),
    };
}

module.exports = {
    removePrefix,
    parseDiceHistory,
    prepareMessage,
    createWebhookBody
};