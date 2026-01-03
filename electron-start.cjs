#!/usr/bin/env node

// Simple CommonJS wrapper to load Electron
const { spawn } = require('child_process');
const path = require('path');

const electronPath = require('electron');
const mainFile = path.join(__dirname, 'electron', 'main.cjs');

// Remove ELECTRON_RUN_AS_NODE to ensure Electron runs as an app, not as Node.js
// This variable is set by Cursor/VSCode and causes Electron to malfunction
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, [mainFile], {
  stdio: 'inherit',
  env
});

child.on('close', (code) => {
  process.exit(code);
});
