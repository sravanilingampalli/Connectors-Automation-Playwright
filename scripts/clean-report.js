const fs = require('fs');
const path = require('path');

const folders = ['playwright-report', 'test-results', 'artifacts'];

for (const folder of folders) {
  const target = path.resolve(__dirname, '..', folder);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${folder}`);
  }
}
