/**
 * Runs integration tests. Uses mock by default (no Firebase credentials needed).
 */
const { spawnSync } = require('child_process');
const path = require('path');

const testDir = path.join(__dirname, 'integration');
const testFiles = [
  'firebase-login-custom-integration-child.js',
  'firebase-login-custom-integration-simple.js',
  'firebase-login-custom-integration-unique.js',
];

for (const file of testFiles) {
  const script = path.join(testDir, file);
  const result = spawnSync('node', [script], { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status);
  }
}
