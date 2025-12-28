/**
 * Popup UI for managing Discord webhooks
 */

import './style.css';
import {
  getWebhooks,
  getActiveWebhookName,
  addWebhook,
  deleteWebhook,
  setActiveWebhook,
  type Webhook,
} from '../../utils/storage';

// DOM Elements
const webhookNameInput = document.getElementById('webhookName') as HTMLInputElement;
const webhookUrlInput = document.getElementById('webhookUrl') as HTMLInputElement;
const addWebhookButton = document.getElementById('addWebhook') as HTMLButtonElement;
const webhookList = document.getElementById('webhookList') as HTMLUListElement;
const activeWebhookSelect = document.getElementById('activeWebhook') as HTMLSelectElement;
const saveActiveButton = document.getElementById('saveActiveWebhook') as HTMLButtonElement;
const addSuccessMessage = document.getElementById('addSuccess') as HTMLParagraphElement;
const saveSuccessMessage = document.getElementById('saveSuccess') as HTMLParagraphElement;

/**
 * Validate webhook URL format
 */
function isValidWebhookUrl(url: string): boolean {
  return url.startsWith('https://discord.com/api/webhooks/') ||
         url.startsWith('https://discordapp.com/api/webhooks/');
}

/**
 * Validate form inputs and update button state
 */
function validateInputs(): void {
  const nameValid = webhookNameInput.value.trim().length > 0;
  const urlValid = isValidWebhookUrl(webhookUrlInput.value.trim());

  addWebhookButton.disabled = !nameValid || !urlValid;
  addWebhookButton.setAttribute('aria-disabled', String(!nameValid || !urlValid));

  if (addWebhookButton.disabled) {
    addWebhookButton.style.opacity = '0.5';
    addWebhookButton.style.cursor = 'not-allowed';
  } else {
    addWebhookButton.style.opacity = '1';
    addWebhookButton.style.cursor = 'pointer';
  }
}

/**
 * Show success message temporarily
 */
function showSuccess(element: HTMLElement): void {
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
}

/**
 * Render the webhook list and active webhook dropdown
 */
async function displayWebhooks(): Promise<void> {
  const [webhooks, activeWebhookName] = await Promise.all([
    getWebhooks(),
    getActiveWebhookName(),
  ]);

  // Clear existing content
  webhookList.innerHTML = '';
  activeWebhookSelect.innerHTML = '';

  if (webhooks.length === 0) {
    // Show empty state
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'No webhooks saved yet';
    emptyMessage.className = 'empty-message';
    webhookList.appendChild(emptyMessage);

    // Add default option for select
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Add a webhook first --';
    activeWebhookSelect.appendChild(defaultOption);
  } else {
    // Render webhook list
    webhooks.forEach((webhook: Webhook) => {
      // List item
      const li = document.createElement('li');
      li.textContent = webhook.name;

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete-btn';
      deleteButton.setAttribute('aria-label', `Delete webhook ${webhook.name}`);
      deleteButton.addEventListener('click', async () => {
        await deleteWebhook(webhook.name);
        displayWebhooks();
      });

      li.appendChild(deleteButton);
      webhookList.appendChild(li);

      // Dropdown option
      const option = document.createElement('option');
      option.value = webhook.name;
      option.textContent = webhook.name;
      if (webhook.name === activeWebhookName) {
        option.selected = true;
      }
      activeWebhookSelect.appendChild(option);
    });
  }
}

/**
 * Handle adding a new webhook
 */
async function handleAddWebhook(): Promise<void> {
  const name = webhookNameInput.value.trim();
  const url = webhookUrlInput.value.trim();

  if (!name || !url) {
    alert('Please provide both a name and a URL.');
    return;
  }

  if (!isValidWebhookUrl(url)) {
    alert('Please enter a valid Discord webhook URL.');
    return;
  }

  try {
    await addWebhook({ name, url });
    showSuccess(addSuccessMessage);
    displayWebhooks();

    // Clear form
    webhookNameInput.value = '';
    webhookUrlInput.value = '';
    validateInputs();
  } catch (error) {
    console.error('Error saving webhook:', error);
    alert('Failed to save webhook. Please try again.');
  }
}

/**
 * Handle saving the active webhook
 */
async function handleSaveActive(): Promise<void> {
  const selectedWebhook = activeWebhookSelect.value;

  if (!selectedWebhook) {
    alert('Please select a webhook.');
    return;
  }

  try {
    await setActiveWebhook(selectedWebhook);
    showSuccess(saveSuccessMessage);
  } catch (error) {
    console.error('Error saving active webhook:', error);
    alert('Failed to save. Please try again.');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  webhookNameInput.addEventListener('input', validateInputs);
  webhookUrlInput.addEventListener('input', validateInputs);
  addWebhookButton.addEventListener('click', handleAddWebhook);
  saveActiveButton.addEventListener('click', handleSaveActive);

  // Initial render
  displayWebhooks();
  validateInputs();
});
