/**
 * Utility functions for Discord message formatting and handling
 */

/**
 * Removes timestamp prefix from history messages
 * @param {string} history - The history message
 * @returns {string} History without timestamp prefix
 */
export function removePrefix(history) {
    return history.replace(/\d{1,2}:\d{2}:\d{2} (AM|PM) Your /, '');
}

/**
 * Parses dice roll history and formats it for Discord
 * @param {string} history - The dice roll history
 * @param {string} title - The roll title
 * @param {string} characterName - The character's name
 * @returns {string} Formatted Discord message
 */
export function parseDiceHistory(history, title, characterName = "Unknown Character") {
    history = removePrefix(history);
    const match = history.split(" ");

    // Handle single-word history
    if (match.length === 1) return history;

    const rollType = match[0];
    const rollValue = match[2] || "";

    const messageTemplates = {
        Critical: `Critical Hit! **${characterName}'s** ${title} caused **${rollValue}** damage.`,
        Attack: `**${characterName}'s** ${title} attempts to hit with a **${rollValue}**.`,
        Damage: `**${characterName}'s** ${title} caused **${rollValue}** damage.`,
        Free: `**${characterName}** rolls ${match[2] || ''} with a ${match[4] || ''}`,
        default: `**${characterName}** rolls ${title} for **${match[1] || ''}**.`
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
export function prepareMessage(title, traits, contentMarkdown) {
    return traits
        ? `**${title}**\n> **Traits:** ${traits}\n> ${contentMarkdown}`
        : `**${title}**\n> ${contentMarkdown}`;
}

/**
 * Creates the request body for Discord webhook
 * @param {string} message - The message to send
 * @param {string} avatarUrl - URL for the webhook avatar
 * @returns {Object} Formatted request body
 */
export function createWebhookBody(message, avatarUrl = "https://i.imgur.com/xi6Qssm.png") {
    return {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            avatar_url: avatarUrl,
            content: message,
        }),
    };
}