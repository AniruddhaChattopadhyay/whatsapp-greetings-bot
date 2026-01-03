const { ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let activityLogger;

async function loadModules() {
  if (!activityLogger) {
    const module = await import(path.join(__dirname, '../../src/utils/logger.js'));
    activityLogger = module.activityLogger;
  }
  return { activityLogger };
}

ipcMain.handle('logs:getActivity', async (event, date) => {
  try {
    const { activityLogger } = await loadModules();
    return { success: true, data: activityLogger.getActivityLogs(date) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('logs:getFailed', async (event, date) => {
  try {
    const { activityLogger } = await loadModules();
    return { success: true, data: activityLogger.getFailedMessages(date) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('logs:export', async (event, outputPath) => {
  try {
    const { activityLogger } = await loadModules();
    const success = activityLogger.exportToCsv(outputPath);
    return { success, data: outputPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// File dialog handlers
ipcMain.handle('files:select', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(options);
    if (result.canceled) {
      return { success: false, canceled: true };
    }
    const content = await fs.readFile(result.filePaths[0], 'utf8');
    return { success: true, data: content, path: result.filePaths[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('files:selectSave', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(options);
    if (result.canceled) {
      return { success: false, canceled: true };
    }
    return { success: true, data: result.filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('files:read', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('files:write', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
