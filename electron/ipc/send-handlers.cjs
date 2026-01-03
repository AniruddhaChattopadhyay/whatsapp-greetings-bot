const { ipcMain } = require('electron');
const path = require('path');

let messageSender, contactManager, templateManager;

async function loadModules() {
  if (!messageSender) {
    const senderModule = await import(path.join(__dirname, '../../src/bot/sender.js'));
    const contactModule = await import(path.join(__dirname, '../../src/contacts/manager.js'));
    const templateModule = await import(path.join(__dirname, '../../src/templates/manager.js'));
    messageSender = senderModule.default;
    contactManager = contactModule.default;
    templateManager = templateModule.default;
  }
  return { messageSender, contactManager, templateManager };
}

// Send to specific contact
ipcMain.handle('send:toContact', async (event, contactId, message, options = {}) => {
  try {
    const { messageSender, contactManager } = await loadModules();
    const contact = contactManager.getContact(contactId);

    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }

    const result = await messageSender.sendToContact(contact, message, options);
    return { success: result.success, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Send to group with template
ipcMain.handle('send:toGroup', async (event, groupName, templateId, options = {}) => {
  try {
    const { messageSender, contactManager, templateManager } = await loadModules();

    const contacts = contactManager.getContactsByGroup(groupName)
      .filter(c => !c.blacklisted);

    if (contacts.length === 0) {
      return { success: false, error: 'No active contacts in group' };
    }

    const template = templateManager.getTemplate(templateId);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Render messages for each contact
    const messages = contacts.map(contact =>
      templateManager.renderTemplate(templateId, contact)
    );

    // Set up progress forwarding
    const progressCallback = (progress) => {
      event.sender.send('send:progress', progress);
    };

    const result = await messageSender.sendBulk(contacts, messages, {
      ...options,
      templateName: template.name,
      onProgress: progressCallback
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Send to all
ipcMain.handle('send:toAll', async (event, templateId, options = {}) => {
  try {
    const { messageSender, contactManager, templateManager } = await loadModules();

    const contacts = contactManager.getActiveContacts();

    if (contacts.length === 0) {
      return { success: false, error: 'No active contacts found' };
    }

    const template = templateManager.getTemplate(templateId);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Render messages for each contact
    const messages = contacts.map(contact =>
      templateManager.renderTemplate(templateId, contact)
    );

    // Set up progress forwarding
    const progressCallback = (progress) => {
      event.sender.send('send:progress', progress);
    };

    const result = await messageSender.sendBulk(contacts, messages, {
      ...options,
      templateName: template.name,
      onProgress: progressCallback
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Send with template to specific contacts
ipcMain.handle('send:withTemplate', async (event, contactIds, templateId, options = {}) => {
  try {
    const { messageSender, contactManager, templateManager } = await loadModules();

    const contacts = contactIds.map(id => contactManager.getContact(id)).filter(Boolean);

    if (contacts.length === 0) {
      return { success: false, error: 'No valid contacts found' };
    }

    const template = templateManager.getTemplate(templateId);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Render messages for each contact
    const messages = contacts.map(contact =>
      templateManager.renderTemplate(templateId, contact)
    );

    // Set up progress forwarding
    const progressCallback = (progress) => {
      event.sender.send('send:progress', progress);
    };

    const result = await messageSender.sendBulk(contacts, messages, {
      ...options,
      templateName: template.name,
      onProgress: progressCallback
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Send custom message
ipcMain.handle('send:custom', async (event, contactIds, message, options = {}) => {
  try {
    const { messageSender, contactManager, templateManager } = await loadModules();

    const contacts = contactIds.map(id => contactManager.getContact(id)).filter(Boolean);

    if (contacts.length === 0) {
      return { success: false, error: 'No valid contacts found' };
    }

    // Parse message for each contact
    const templateParser = (await import(path.join(__dirname, '../../src/templates/parser.js'))).default;
    const messages = contacts.map(contact =>
      templateParser.parseForContact(message, contact)
    );

    // Set up progress forwarding
    const progressCallback = (progress) => {
      event.sender.send('send:progress', progress);
    };

    const result = await messageSender.sendBulk(contacts, messages, {
      ...options,
      templateName: 'custom',
      onProgress: progressCallback
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get rate limit info
ipcMain.handle('send:getRateLimitInfo', async () => {
  try {
    const { messageSender } = await loadModules();
    return { success: true, data: messageSender.getRateLimitInfo() };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
