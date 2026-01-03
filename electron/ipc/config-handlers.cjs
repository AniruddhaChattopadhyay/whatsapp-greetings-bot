const { ipcMain } = require('electron');
const path = require('path');

let config;

async function loadModules() {
  if (!config) {
    const module = await import(path.join(__dirname, '../../src/utils/config.js'));
    config = module.default;
  }
  return { config };
}

ipcMain.handle('config:getAll', async () => {
  try {
    const { config } = await loadModules();
    return { success: true, data: config.getAll() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('config:get', async (event, key) => {
  try {
    const { config } = await loadModules();
    return { success: true, data: config.get(key) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('config:set', async (event, key, value) => {
  try {
    const { config } = await loadModules();
    config.set(key, value);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('config:reset', async () => {
  try {
    const { config } = await loadModules();
    config.reset();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
