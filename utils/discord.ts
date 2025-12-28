/**
 * Discord message formatting and webhook utilities
 */

export const DISCORD_MESSAGE_LIMIT = 2000;
export const DISCORD_AVATAR_URL = 'https://i.imgur.com/xi6Qssm.png';

export interface WebhookBody {
  method: 'POST';
  headers: { 'Content-Type': 'application/json' };
  body: string;
}

/**
 * Format a dice roll for Discord.
 * Keep it simple - include the full text as-is (timestamp and all).
 * Timestamps vary by locale/machine, no need to parse them.
 */
export function formatDiceRoll(
  characterName: string,
  diceTitle: string,
  rollText: string
): string {
  // Keep full text, just clean up whitespace and format as blockquote
  const lines = rollText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line => `> ${line}`)
    .join('\n');

  return `**${characterName}** rolled **${diceTitle}**:\n${lines}`;
}

/**
 * Prepare a listview item (spell, feat, etc.) for Discord
 */
export function prepareMessage(
  title: string,
  traits: string,
  contentMarkdown: string
): string {
  const lines = contentMarkdown.split('\n').map(line => `> ${line}`).join('\n');
  return traits
    ? `**${title}**\n> **Traits:** ${traits}\n${lines}`
    : `**${title}**\n${lines}`;
}

/**
 * Create webhook request body
 */
export function createWebhookBody(
  message: string,
  avatarUrl: string = DISCORD_AVATAR_URL
): WebhookBody {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      avatar_url: avatarUrl,
      content: message,
    }),
  };
}

/**
 * Check if message exceeds Discord's limit
 */
export function isMessageTooLarge(message: string): boolean {
  return new TextEncoder().encode(message).length > DISCORD_MESSAGE_LIMIT;
}

/**
 * Truncate message to fit Discord's limit
 */
export function truncateMessage(message: string, maxLength: number = 1900): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...\n> *(truncated)*';
}
