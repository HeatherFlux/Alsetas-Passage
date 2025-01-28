/**
 * Background script for Alseta's Passage extension
 */

import discordManager from './src/modules/discordManager.js';

// Initialize Discord manager and set up message listeners
discordManager.setupMessageListeners();
