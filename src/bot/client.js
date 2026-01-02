import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import logger from '../utils/logger.js';
import config from '../utils/config.js';

class WhatsAppClient {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      logger.info('WhatsApp client already initialized');
      return this.client;
    }

    logger.info('Initializing WhatsApp client...');

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.get('whatsapp.sessionPath')
      }),
      puppeteer: config.get('whatsapp.puppeteerOptions')
    });

    this.setupEventHandlers();

    await this.client.initialize();
    this.isInitialized = true;

    return this.client;
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      console.log('\n📱 Scan this QR code with your WhatsApp mobile app:\n');
      qrcode.generate(qr, { small: true });
      console.log('\nOpen WhatsApp on your phone > Settings > Linked Devices > Link a Device\n');
    });

    this.client.on('authenticated', () => {
      logger.info('WhatsApp authenticated successfully');
      console.log('✅ Authentication successful!');
    });

    this.client.on('ready', () => {
      this.isReady = true;
      logger.info('WhatsApp client is ready');
      console.log('✅ WhatsApp client is ready!\n');
    });

    this.client.on('auth_failure', (msg) => {
      logger.error('Authentication failure', { error: msg });
      console.error('❌ Authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      logger.warn('WhatsApp client disconnected', { reason });
      console.log('⚠️  Disconnected from WhatsApp:', reason);
    });

    this.client.on('message', async (msg) => {
      logger.debug('Message received', {
        from: msg.from,
        body: msg.body?.substring(0, 50)
      });
    });
  }

  async waitUntilReady(timeout = 60000) {
    const startTime = Date.now();

    while (!this.isReady) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for WhatsApp client to be ready');
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return true;
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      // Format phone number (remove special characters, add country code if needed)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = formattedNumber + '@c.us';

      // Check if number is registered on WhatsApp
      const isRegistered = await this.client.isRegisteredUser(chatId);
      if (!isRegistered) {
        throw new Error(`Phone number ${phoneNumber} is not registered on WhatsApp`);
      }

      await this.client.sendMessage(chatId, message);
      logger.info('Message sent successfully', { to: phoneNumber });
      return { success: true, phoneNumber };
    } catch (error) {
      logger.error('Failed to send message', {
        to: phoneNumber,
        error: error.message
      });
      throw error;
    }
  }

  formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If number doesn't start with country code, you might want to add it
    // This is a simple check - you may need to customize based on your needs
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      // Assuming Indian numbers - customize this for your region
      cleaned = '91' + cleaned;
    }

    return cleaned;
  }

  async getContactInfo(phoneNumber) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = formattedNumber + '@c.us';
      const contact = await this.client.getContactById(chatId);

      return {
        id: contact.id._serialized,
        name: contact.name || contact.pushname || phoneNumber,
        isRegistered: contact.isWAContact,
        phone: phoneNumber
      };
    } catch (error) {
      logger.error('Failed to get contact info', {
        phoneNumber,
        error: error.message
      });
      return null;
    }
  }

  async isNumberRegistered(phoneNumber) {
    if (!this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = formattedNumber + '@c.us';
      return await this.client.isRegisteredUser(chatId);
    } catch (error) {
      logger.error('Failed to check if number is registered', {
        phoneNumber,
        error: error.message
      });
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      this.isInitialized = false;
      logger.info('WhatsApp client disconnected');
      console.log('👋 Disconnected from WhatsApp');
    }
  }

  getClient() {
    return this.client;
  }

  isClientReady() {
    return this.isReady;
  }
}

// Export singleton instance
export default new WhatsAppClient();
