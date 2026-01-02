#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import whatsappClient from '../bot/client.js';
import logger from '../utils/logger.js';

const program = new Command();

program
  .name('greetings-bot')
  .description('WhatsApp Greetings Bot - Send personalized messages to multiple contacts')
  .version('1.0.0');

// Initialize command
program
  .command('init')
  .description('Initialize and authenticate with WhatsApp')
  .action(async () => {
    try {
      console.log(chalk.blue('🚀 Initializing WhatsApp client...\n'));
      await whatsappClient.initialize();
      await whatsappClient.waitUntilReady();
      console.log(chalk.green('\n✅ Successfully connected to WhatsApp!'));
      console.log(chalk.gray('You can now use other commands to send messages.\n'));
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('❌ Failed to initialize:'), error.message);
      logger.error('Initialization failed', { error: error.message });
      process.exit(1);
    }
  });

// Send commands
import sendCommand from './commands/send.js';
program.addCommand(sendCommand);

// Contacts commands
import contactsCommand from './commands/contacts.js';
program.addCommand(contactsCommand);

// Templates commands
import templatesCommand from './commands/templates.js';
program.addCommand(templatesCommand);

// Config commands
import configCommand from './commands/config.js';
program.addCommand(configCommand);

// Logs command
program
  .command('logs')
  .description('View activity logs')
  .option('-d, --date <date>', 'Filter by date (YYYY-MM-DD)')
  .option('-f, --failed', 'Show only failed messages')
  .option('-e, --export <file>', 'Export logs to CSV file')
  .action(async (options) => {
    const { activityLogger } = await import('../utils/logger.js');

    try {
      if (options.export) {
        const success = activityLogger.exportToCsv(options.export);
        if (success) {
          console.log(chalk.green(`✅ Logs exported to ${options.export}`));
        } else {
          console.log(chalk.yellow('⚠️  No logs to export'));
        }
        return;
      }

      let logs = options.failed
        ? activityLogger.getFailedMessages(options.date)
        : activityLogger.getActivityLogs(options.date);

      if (logs.length === 0) {
        console.log(chalk.yellow('📭 No logs found'));
        return;
      }

      console.log(chalk.blue(`\n📋 Activity Logs (${logs.length} entries)\n`));
      logs.slice(-20).forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const status = log.status === 'success' ? chalk.green('✓') : chalk.red('✗');
        console.log(`${status} ${timestamp} - ${log.contact} (${log.phone})`);
        if (log.error) {
          console.log(chalk.red(`   Error: ${log.error}`));
        }
      });

      if (logs.length > 20) {
        console.log(chalk.gray(`\n... showing last 20 of ${logs.length} entries`));
      }
    } catch (error) {
      console.error(chalk.red('❌ Failed to retrieve logs:'), error.message);
    }
  });

// Status command
program
  .command('status')
  .description('Show current bot status and statistics')
  .action(async () => {
    const contactManager = (await import('../contacts/manager.js')).default;
    const templateManager = (await import('../templates/manager.js')).default;
    const messageSender = (await import('../bot/sender.js')).default;

    try {
      const contactStats = contactManager.getStats();
      const templates = templateManager.getAllTemplates();
      const rateLimitInfo = messageSender.getRateLimitInfo();

      console.log(chalk.blue('\n📊 Bot Status\n'));
      console.log('WhatsApp:', whatsappClient.isClientReady()
        ? chalk.green('Connected ✓')
        : chalk.red('Disconnected ✗')
      );

      console.log('\n' + chalk.bold('Contacts:'));
      console.log(`  Total: ${contactStats.total}`);
      console.log(`  Active: ${contactStats.active}`);
      console.log(`  Blacklisted: ${contactStats.blacklisted}`);

      console.log('\n' + chalk.bold('Groups:'));
      Object.entries(contactStats.byGroup).forEach(([group, count]) => {
        console.log(`  ${group}: ${count}`);
      });

      console.log('\n' + chalk.bold('Templates:'));
      console.log(`  Available: ${templates.length}`);

      console.log('\n' + chalk.bold('Rate Limits:'));
      if (rateLimitInfo.enabled) {
        console.log(`  Daily Limit: ${rateLimitInfo.limit}`);
        console.log(`  Remaining Today: ${rateLimitInfo.remaining}`);
      } else {
        console.log(`  Rate limiting: Disabled`);
      }

      console.log('');
    } catch (error) {
      console.error(chalk.red('❌ Failed to get status:'), error.message);
    }
  });

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error.code !== 'commander.help' && error.code !== 'commander.helpDisplayed') {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
