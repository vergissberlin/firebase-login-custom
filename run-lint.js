const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
try {
  const out = execSync('pnpm run lint', {
    cwd: __dirname,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  fs.writeFileSync(path.join(__dirname, 'lint-result.txt'), out || '(no output)');
} catch (e) {
  const msg = (e.stdout || '') + '\n' + (e.stderr || '') + '\n' + (e.message || '');
  fs.writeFileSync(path.join(__dirname, 'lint-result.txt'), msg);
}
