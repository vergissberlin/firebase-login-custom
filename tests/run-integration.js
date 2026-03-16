/**
 * Runs integration tests. Uses Firebase 5 app/database/auth only (no Firestore/grpc),
 * so tests run on Node 20, 22, 25, etc.
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
