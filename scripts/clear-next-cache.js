#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Next.js cache...');

const cacheDirs = [
  '.next',
  'node_modules/.cache',
  '.turbo'
];

cacheDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    console.log(`${dir} not found, skipping...`);
  }
});

console.log('✅ Cache cleared! You can now restart your development server.');
