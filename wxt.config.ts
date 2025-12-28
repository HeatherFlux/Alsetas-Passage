import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // Extension manifest configuration
  manifest: {
    name: "Alseta's Passage",
    description: "Share Pathbuilder2e character actions and dice rolls to Discord",
    version: "2.1.0",

    permissions: [
      "storage"
    ],

    icons: {
      16: "icon16.png",
      48: "icon48.png",
      128: "icon128.png",
      512: "icon512.png"
    },

    // Firefox-specific settings (automatically applied for Firefox builds)
    browser_specific_settings: {
      gecko: {
        id: "alsetas-passage@pathbuilder2e.com",
        strict_min_version: "109.0"
      }
    }
  },

  // Output configuration
  outDir: ".output",

  // Zip configuration for store submission
  zip: {
    name: "alsetas-passage",
    includeSources: ["entrypoints/**", "utils/**", "modules/**", "assets/**", "public/**", "*.ts", "*.json"]
  },

  // Auto-imports for common WXT utilities
  imports: {
    addons: {
      vueTemplate: false
    }
  }
});
