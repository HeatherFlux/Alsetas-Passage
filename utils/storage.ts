/**
 * Storage utilities for managing webhooks and extension settings
 */

export interface Webhook {
  name: string;
  url: string;
}

export interface StorageData {
  webhooks: Webhook[];
  activeWebhook: string;
}

const STORAGE_KEYS = {
  WEBHOOKS: 'webhooks',
  ACTIVE_WEBHOOK: 'activeWebhook',
} as const;

/**
 * Get all webhooks from storage
 */
export async function getWebhooks(): Promise<Webhook[]> {
  const result = await browser.storage.sync.get(STORAGE_KEYS.WEBHOOKS);
  return (result[STORAGE_KEYS.WEBHOOKS] as Webhook[] | undefined) || [];
}

/**
 * Get the active webhook name
 */
export async function getActiveWebhookName(): Promise<string | null> {
  const result = await browser.storage.sync.get(STORAGE_KEYS.ACTIVE_WEBHOOK);
  return (result[STORAGE_KEYS.ACTIVE_WEBHOOK] as string | undefined) || null;
}

/**
 * Get the active webhook configuration
 */
export async function getActiveWebhook(): Promise<Webhook | null> {
  const [webhooks, activeWebhookName] = await Promise.all([
    getWebhooks(),
    getActiveWebhookName(),
  ]);

  if (!activeWebhookName) return null;
  return webhooks.find(w => w.name === activeWebhookName) || null;
}

/**
 * Save a new webhook
 */
export async function addWebhook(webhook: Webhook): Promise<void> {
  const webhooks = await getWebhooks();
  webhooks.push(webhook);
  await browser.storage.sync.set({ webhooks });
}

/**
 * Delete a webhook by name
 */
export async function deleteWebhook(name: string): Promise<void> {
  const webhooks = await getWebhooks();
  const filtered = webhooks.filter(w => w.name !== name);
  await browser.storage.sync.set({ webhooks: filtered });
}

/**
 * Set the active webhook
 */
export async function setActiveWebhook(name: string): Promise<void> {
  await browser.storage.sync.set({ activeWebhook: name });
}

/**
 * Get all storage data
 */
export async function getAllStorageData(): Promise<StorageData> {
  const result = await browser.storage.sync.get([
    STORAGE_KEYS.WEBHOOKS,
    STORAGE_KEYS.ACTIVE_WEBHOOK,
  ]);
  return {
    webhooks: (result[STORAGE_KEYS.WEBHOOKS] as Webhook[] | undefined) || [],
    activeWebhook: (result[STORAGE_KEYS.ACTIVE_WEBHOOK] as string | undefined) || '',
  };
}
