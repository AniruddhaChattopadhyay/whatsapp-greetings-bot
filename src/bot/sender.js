import whatsappClient from './client.js';
import contactManager from '../contacts/manager.js';
import logger, { activityLogger } from '../utils/logger.js';
import { getRandomDelay, sleep, rateLimiter } from '../utils/delay.js';
import config from '../utils/config.js';

class MessageSender {
  constructor() {
    this.isSending = false;
    this.currentProgress = {
      total: 0,
      sent: 0,
      failed: 0,
      skipped: 0
    };
  }

  async sendToContact(contact, message, options = {}) {
    const { dryRun = false, maxRetries = config.get('retries.maxAttempts') || 3 } = options;

    // Check if contact is blacklisted
    if (contact.blacklisted) {
      logger.info('Contact is blacklisted, skipping', { name: contact.name });
      return { success: false, reason: 'blacklisted', contact };
    }

    // Check rate limit
    const rateCheck = rateLimiter.checkAndIncrement();
    if (!rateCheck.allowed) {
      logger.warn('Rate limit exceeded', { remaining: rateCheck.remaining });
      return { success: false, reason: 'rate_limit', message: rateCheck.message, contact };
    }

    // Dry run mode
    if (dryRun) {
      logger.info('DRY RUN: Would send message', {
        to: contact.name,
        phone: contact.phone,
        messagePreview: message.substring(0, 50)
      });
      return { success: true, dryRun: true, contact };
    }

    // Attempt to send with retries
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await whatsappClient.sendMessage(contact.phone, message);

        // Update last sent timestamp
        contactManager.updateLastSent(contact.id);

        // Log activity
        activityLogger.logMessageSent(contact, options.templateName || 'custom', 'success');

        logger.info('Message sent successfully', {
          to: contact.name,
          phone: contact.phone,
          attempt
        });

        return { success: true, contact, attempt };
      } catch (error) {
        lastError = error;
        logger.warn(`Failed to send message (attempt ${attempt}/${maxRetries})`, {
          to: contact.name,
          phone: contact.phone,
          error: error.message
        });

        if (attempt < maxRetries) {
          // Exponential backoff
          const backoffDelay = 1000 * Math.pow(config.get('retries.backoffMultiplier') || 2, attempt - 1);
          await sleep(backoffDelay);
        }
      }
    }

    // All retries failed
    activityLogger.logMessageSent(contact, options.templateName || 'custom', 'failed', lastError);
    logger.error('Failed to send message after all retries', {
      to: contact.name,
      phone: contact.phone,
      error: lastError.message
    });

    return { success: false, reason: 'send_failed', error: lastError.message, contact };
  }

  async sendBulk(contacts, message, options = {}) {
    const {
      dryRun = false,
      onProgress = null,
      templateName = 'custom'
    } = options;

    if (this.isSending) {
      throw new Error('A bulk send operation is already in progress');
    }

    this.isSending = true;
    this.currentProgress = {
      total: contacts.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      results: []
    };

    logger.info('Starting bulk send', {
      totalContacts: contacts.length,
      dryRun,
      templateName
    });

    console.log(`\n📤 Starting bulk send to ${contacts.length} contacts${dryRun ? ' (DRY RUN)' : ''}...\n`);

    // Check if message is an array (one message per contact) or a single string
    const isMessageArray = Array.isArray(message);

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const messageToSend = isMessageArray ? message[i] : message;

      // Send progress update
      if (onProgress) {
        onProgress({
          ...this.currentProgress,
          currentIndex: i,
          currentContact: contact
        });
      }

      // Send message
      const result = await this.sendToContact(contact, messageToSend, {
        dryRun,
        templateName
      });

      // Update progress
      if (result.success) {
        this.currentProgress.sent++;
      } else if (result.reason === 'blacklisted') {
        this.currentProgress.skipped++;
      } else {
        this.currentProgress.failed++;
      }

      this.currentProgress.results.push(result);

      // Display progress
      const status = result.success ? '✓' : (result.reason === 'blacklisted' ? '○' : '✗');
      console.log(`${status} [${i + 1}/${contacts.length}] ${contact.name} (${contact.phone})`);

      // Add delay between messages (except for the last one)
      if (i < contacts.length - 1 && !dryRun) {
        const delay = getRandomDelay();
        const delaySeconds = (delay / 1000).toFixed(1);
        process.stdout.write(`   ⏳ Waiting ${delaySeconds}s before next message...`);

        await sleep(delay);
        process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear the waiting line
      }
    }

    this.isSending = false;

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Bulk Send Summary:');
    console.log('='.repeat(50));
    console.log(`Total:    ${this.currentProgress.total}`);
    console.log(`✓ Sent:     ${this.currentProgress.sent}`);
    console.log(`✗ Failed:   ${this.currentProgress.failed}`);
    console.log(`○ Skipped:  ${this.currentProgress.skipped}`);
    console.log('='.repeat(50) + '\n');

    logger.info('Bulk send completed', this.currentProgress);

    return this.currentProgress;
  }

  async sendToGroup(groupName, message, options = {}) {
    const contacts = contactManager.getContactsByGroup(groupName);

    if (contacts.length === 0) {
      throw new Error(`No contacts found in group: ${groupName}`);
    }

    // Filter out blacklisted contacts
    const activeContacts = contacts.filter(c => !c.blacklisted);

    if (activeContacts.length === 0) {
      throw new Error(`No active contacts in group: ${groupName}`);
    }

    console.log(`📋 Found ${activeContacts.length} active contacts in group "${groupName}"`);

    return this.sendBulk(activeContacts, message, options);
  }

  async sendToAll(message, options = {}) {
    const contacts = contactManager.getActiveContacts();

    if (contacts.length === 0) {
      throw new Error('No active contacts found');
    }

    console.log(`📋 Found ${contacts.length} active contacts`);

    return this.sendBulk(contacts, message, options);
  }

  getProgress() {
    return { ...this.currentProgress };
  }

  isCurrentlySending() {
    return this.isSending;
  }

  getRateLimitInfo() {
    return {
      remaining: rateLimiter.getRemainingCount(),
      limit: config.get('limits.dailyLimit'),
      enabled: config.get('limits.enabled')
    };
  }
}

export default new MessageSender();
