const { ipcMain } = require('electron');
const path = require('path');

let templateManager;

async function loadModules() {
  if (!templateManager) {
    const module = await import(path.join(__dirname, '../../src/templates/manager.js'));
    templateManager = module.default;
  }
  return { templateManager };
}

ipcMain.handle('templates:getAll', async () => {
  try {
    const { templateManager } = await loadModules();
    return { success: true, data: templateManager.getAllTemplates() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:get', async (event, id) => {
  try {
    const { templateManager } = await loadModules();
    return { success: true, data: templateManager.getTemplate(id) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:getByOccasion', async (event, occasion) => {
  try {
    const { templateManager } = await loadModules();
    return { success: true, data: templateManager.getTemplatesByOccasion(occasion) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:getOccasions', async () => {
  try {
    const { templateManager } = await loadModules();
    return { success: true, data: templateManager.getOccasions() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:create', async (event, template) => {
  try {
    const { templateManager } = await loadModules();
    const result = templateManager.createTemplate(template);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:update', async (event, id, updates) => {
  try {
    const { templateManager } = await loadModules();
    const result = templateManager.updateTemplate(id, updates);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:delete', async (event, id) => {
  try {
    const { templateManager } = await loadModules();
    const result = templateManager.deleteTemplate(id);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:preview', async (event, id, data) => {
  try {
    const { templateManager } = await loadModules();
    const result = templateManager.previewTemplate(id, data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:search', async (event, query) => {
  try {
    const { templateManager } = await loadModules();
    return { success: true, data: templateManager.searchTemplates(query) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('templates:resetDefaults', async () => {
  try {
    const { templateManager } = await loadModules();
    const result = templateManager.resetToDefaults();
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
