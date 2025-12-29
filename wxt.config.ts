import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  // Extension manifest configuration
  manifest: {
    name: "Alseta's Passage",
    description: "Share Pathbuilder2e character actions and dice rolls to Discord",
    version: "2.1.1",

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
        id: "{e7849c1d-9c1d-4592-a557-5b84d428224a}",
        strict_min_version: "142.0",
        // @ts-expect-error - data_collection_permissions is a new Firefox field not in WXT types yet
        data_collection_permissions: {
          required: ["none"]
        }
      } as const
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
