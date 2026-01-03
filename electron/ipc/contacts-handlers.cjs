const { ipcMain } = require('electron');
const path = require('path');

let contactManager;

async function loadModules() {
  if (!contactManager) {
    const module = await import(path.join(__dirname, '../../src/contacts/manager.js'));
    contactManager = module.default;
  }
  return { contactManager };
}

// Get all contacts
ipcMain.handle('contacts:getAll', async () => {
  try {
    const { contactManager } = await loadModules();
    return { success: true, data: contactManager.getAllContacts() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get active contacts
ipcMain.handle('contacts:getActive', async () => {
  try {
    const { contactManager } = await loadModules();
    return { success: true, data: contactManager.getActiveContacts() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get by group
ipcMain.handle('contacts:getByGroup', async (event, group) => {
  try {
    const { contactManager } = await loadModules();
    return { success: true, data: contactManager.getContactsByGroup(group) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get groups
ipcMain.handle('contacts:getGroups', async () => {
  try {
    const { contactManager } = await loadModules();
    return { success: true, data: contactManager.getGroups() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get stats
ipcMain.handle('contacts:getStats', async () => {
  try {
    const { contactManager } = await loadModules();
    return { success: true, data: contactManager.getStats() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Add contact
ipcMain.handle('contacts:add', async (event, contact) => {
  try {
    const { contactManager } = await loadModules();
    const result = contactManager.addContact(contact);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Update contact
ipcMain.handle('contacts:update', async (event, id, updates) => {
  try {
    const { contactManager } = await loadModules();
    const result = contactManager.updateContact(id, updates);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Delete contact
ipcMain.handle('contacts:delete', async (event, id) => {
  try {
    const { contactManager } = await loadModules();
    const result = contactManager.deleteContact(id);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Blacklist contact
ipcMain.handle('contacts:blacklist', async (event, id, value) => {
  try {
    const { contactManager } = await loadModules();
    const result = contactManager.blacklistContact(id, value);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Search contacts
ipcMain.handle('contacts:search', async (event, query) => {
  try {
    const { contactManager } = await loadModules();
    return { success: true, data: contactManager.searchContacts(query) };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Import CSV
ipcMain.handle('contacts:importCSV', async (event, csvData) => {
  try {
    const { contactManager } = await loadModules();
    const result = contactManager.importFromCSV(csvData);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Export CSV
ipcMain.handle('contacts:exportCSV', async () => {
  try {
    const { contactManager } = await loadModules();
    const csv = contactManager.exportToCSV();
    return { success: true, data: csv };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Add group
ipcMain.handle('contacts:addGroup', async (event, name) => {
  try {
    const { contactManager } = await loadModules();
    const result = contactManager.addGroup(name);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
