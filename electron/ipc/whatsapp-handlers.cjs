const { ipcMain } = require('electron');
const path = require('path');

// Import our existing backend modules
// Using dynamic import for ES modules
let whatsappClient;

async function loadModules() {
  if (!whatsappClient) {
    const module = await import(path.join(__dirname, '../../src/bot/client.js'));
    whatsappClient = module.default;
  }
  return { whatsappClient };
}

// Initialize WhatsApp
ipcMain.handle('whatsapp:initialize', async (event) => {
  try {
    const { whatsappClient } = await loadModules();

    // Set up event forwarding to renderer
    const client = whatsappClient.getClient();
    if (client) {
      client.removeAllListeners('qr');
      client.removeAllListeners('ready');
      client.removeAllListeners('disconnected');

      client.on('qr', (qr) => {
        event.sender.send('whatsapp:qr', qr);
      });

      client.on('ready', () => {
        event.sender.send('whatsapp:ready');
      });

      client.on('disconnected', (reason) => {
        event.sender.send('whatsapp:disconnected', reason);
      });
    }

    await whatsappClient.initialize();
    await whatsappClient.waitUntilReady();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Disconnect
ipcMain.handle('whatsapp:disconnect', async () => {
  try {
    const { whatsappClient } = await loadModules();
    await whatsappClient.disconnect();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get status
ipcMain.handle('whatsapp:getStatus', async () => {
  try {
    const { whatsappClient } = await loadModules();
    return {
      isReady: whatsappClient.isClientReady(),
      isInitialized: whatsappClient.isInitialized
    };
  } catch (error) {
    return {
      isReady: false,
      isInitialized: false,
      error: error.message
    };
  }
});

// Is ready
ipcMain.handle('whatsapp:isReady', async () => {
  try {
    const { whatsappClient } = await loadModules();
    return whatsappClient.isClientReady();
  } catch (error) {
    return false;
  }
});
