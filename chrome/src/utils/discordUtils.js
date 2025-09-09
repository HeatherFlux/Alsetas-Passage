/**
 * Utility functions for Discord message formatting and handling
 */

/**
 * Removes timestamp prefix from history messages
 * Handles various locale timestamp formats including:
 * - US English: "10:45:30 AM Your" or "2:30:45 PM Your"
 * - Lowercase with periods: "10:45:30 a.m. Your" or "10:45:30 p.m. Your"
 * - 24-hour format: "14:30:45 Your" or "22:30:45 Your"
 * - Formats with/without seconds
 * - Various spacing and case variations
 * 
 * @param {string} history - The history message
 * @returns {string} History without timestamp prefix
 */
function removePrefix(history) {
    // Ultra-comprehensive regex to handle all possible locale timestamp formats
    // Pattern breakdown:
    // ^\s* - optional leading whitespace
    // (?:午前|午後|上午|下午|오전|오후)?\s* - optional Asian AM/PM markers with space
    // \d{1,2} - 1-2 digits for hour
    // [:.：·h-_] - various separators (colon, dot, full-width colon, middle dot, h, dash, underscore)
    // \d{1,2} - 1-2 digits for minutes (allowing single digit)
    // (?:[:.：·ms-_]\d{1,2}(?:\.\d+)?)?s? - optional seconds with separators, decimals, and optional 's'
    // \s* - optional space before AM/PM
    // (?:AM|PM|A\.M\.|P\.M\.|a\.m\.|p\.m\.|am|pm|Am|Pm|aM|pM|AM\.|PM\.|nachm\.)? - AM/PM variations
    // \s+ - one or more spaces
    // Your\s+ - "Your" followed by space(s)
    const timestampRegex = /^\s*(?:午前|午後|上午|下午|오전\s|오후\s)?\s*\d{1,2}[:.：·h\-_]\d{1,2}(?:[:.：·ms\-_]\d{1,2}(?:\.\d+)?)?s?\s*(?:AM|PM|A\.M\.|P\.M\.|a\.m\.|p\.m\.|am|pm|Am|Pm|aM|pM|AM\.|PM\.|nachm\.)?\s+Your\s+/i;
    
    return history.replace(timestampRegex, '');
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