/**
 * Build info updater script
 * This script updates the buildInfo.js files with the current build information
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Function to generate a hash based on the current timestamp and files
function generateBuildHash() {
  const timestamp = Date.now().toString();
  const randomData = Math.random().toString();
  const hash = crypto.createHash('md5').update(timestamp + randomData).digest('hex');
  return hash.substring(0, 8); // Return first 8 characters of the hash
}

// Function to get formatted time HH:MM:SS
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Function to ensure directory exists
function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to update build info file
function updateBuildInfo(targetPath) {
  // Generate build hash and date
  const buildHash = generateBuildHash();
  const buildDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const buildTime = getCurrentTime();
  
  console.log(`Creating new build info for ${targetPath}`);
  console.log(`Build hash: ${buildHash}`);
  console.log(`Build date: ${buildDate}`);
  console.log(`Build time: ${buildTime}`);
  
  try {
    // Ensure directory exists
    const dirPath = path.dirname(targetPath);
    ensureDirExists(dirPath);
    
    // Always create a new file with fresh content
    const content = `/**
 * Build information - DO NOT MODIFY THIS FILE
 * This file is auto-generated during the build process
 */

export const BUILD_INFO = {
    buildHash: '${buildHash}',
    buildDate: '${buildDate}',
    buildTime: '${buildTime}'
};

export default BUILD_INFO;`;
    
    // Write the file
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`Successfully created new build info at ${targetPath}`);
  } catch (error) {
    console.error(`Error creating build info for ${targetPath}:`, error);
    process.exit(1);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const targetBrowser = args[0] || 'both';
  
  if (targetBrowser === 'chrome' || targetBrowser === 'both') {
    updateBuildInfo(path.join(__dirname, 'chrome', 'src', 'modules', 'buildInfo.js'));
  }
  
  if (targetBrowser === 'firefox' || targetBrowser === 'both') {
    updateBuildInfo(path.join(__dirname, 'firefox', 'src', 'modules', 'buildInfo.js'));
  }
}

// Run the script
main(); 