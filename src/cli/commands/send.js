import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import whatsappClient from '../../bot/client.js';
import messageSender from '../../bot/sender.js';
import contactManager from '../../contacts/manager.js';
import templateManager from '../../templates/manager.js';
import logger from '../../utils/logger.js';

const sendCommand = new Command('send')
  .description('Send messages to contacts');

// Send with template
sendCommand
  .command('template')
  .description('Send a message using a template')
  .option('-t, --template <id>', 'Template ID or name')
  .option('-g, --group <name>', 'Send to a specific group')
  .option('-c, --contact <name>', 'Send to a specific contact')
  .option('-a, --all', 'Send to all active contacts')
  .option('-d, --dry-run', 'Preview without actually sending')
  .action(async (options) => {
    try {
      // Get template
      let template;
      if (options.template) {
        template = templateManager.getTemplate(options.template) ||
                   templateManager.getTemplateByName(options.template);
        if (!template) {
          console.error(chalk.red(`❌ Template "${options.template}" not found`));
          return;
        }
      } else {
        // Interactive template selection
        const templates = templateManager.getAllTemplates();
        const { selectedTemplate } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedTemplate',
            message: 'Select a template:',
            choices: templates.map(t => ({
              name: `${t.name} (${t.occasion})`,
              value: t.id
            }))
          }
        ]);
        template = templateManager.getTemplate(selectedTemplate);
      }

      // Show preview
      console.log(chalk.blue('\n📝 Template Preview:\n'));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(templateManager.previewTemplate(template.id));
      console.log(chalk.gray('─'.repeat(50)));

      // Get target contacts
      let contacts;
      if (options.all) {
        contacts = contactManager.getActiveContacts();
      } else if (options.group) {
        contacts = contactManager.getContactsByGroup(options.group)
          .filter(c => !c.blacklisted);
      } else if (options.contact) {
        const contact = contactManager.searchContacts(options.contact)[0];
        if (!contact) {
          console.error(chalk.red(`❌ Contact "${options.contact}" not found`));
          return;
        }
        contacts = [contact];
      } else {
        // Interactive selection
        const { target } = await inquirer.prompt([
          {
            type: 'list',
            name: 'target',
            message: 'Send to:',
            choices: [
              { name: 'All active contacts', value: 'all' },
              { name: 'Specific group', value: 'group' },
              { name: 'Specific contact', value: 'contact' }
            ]
          }
        ]);

        if (target === 'all') {
          contacts = contactManager.getActiveContacts();
        } else if (target === 'group') {
          const groups = contactManager.getGroups();
          const { selectedGroup } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedGroup',
              message: 'Select group:',
              choices: groups
            }
          ]);
          contacts = contactManager.getContactsByGroup(selectedGroup)
            .filter(c => !c.blacklisted);
        } else {
          const allContacts = contactManager.getActiveContacts();
          const { selectedContact } = await inquirer.prompt([
            {
              type: 'list',
              name: 'selectedContact',
              message: 'Select contact:',
              choices: allContacts.map(c => ({
                name: `${c.name} (${c.phone})`,
                value: c.id
              }))
            }
          ]);
          contacts = [contactManager.getContact(selectedContact)];
        }
      }

      if (contacts.length === 0) {
        console.log(chalk.yellow('⚠️  No contacts found'));
        return;
      }

      console.log(chalk.blue(`\n📋 Will send to ${contacts.length} contact(s)`));

      // Confirm if not dry run
      if (!options.dryRun) {
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Send messages to ${contacts.length} contacts?`,
            default: false
          }
        ]);

        if (!confirm) {
          console.log(chalk.yellow('Cancelled'));
          return;
        }

        // Initialize WhatsApp client
        console.log(chalk.blue('\n🔌 Connecting to WhatsApp...\n'));
        await whatsappClient.initialize();
        await whatsappClient.waitUntilReady();
      }

      // Render messages for all contacts
      const messages = templateManager.renderTemplateForAll(template.id, contacts);

      // Send messages
      const results = await messageSender.sendBulk(
        contacts,
        messages.map(m => m.message),
        {
          dryRun: options.dryRun,
          templateName: template.name
        }
      );

      // Show results
      if (options.dryRun) {
        console.log(chalk.green('\n✅ Dry run completed successfully'));
      } else {
        if (results.failed > 0) {
          console.log(chalk.yellow(`\n⚠️  ${results.failed} message(s) failed to send`));
          console.log(chalk.gray('Use "greetings-bot logs --failed" to see details'));
        }
        await whatsappClient.disconnect();
      }

    } catch (error) {
      console.error(chalk.red('❌ Failed to send messages:'), error.message);
      logger.error('Send command failed', { error: error.message });
      process.exit(1);
    }
  });

// Send custom message
sendCommand
  .command('custom')
  .description('Send a custom message')
  .option('-m, --message <text>', 'Message text')
  .option('-g, --group <name>', 'Send to a specific group')
  .option('-c, --contact <name>', 'Send to a specific contact')
  .option('-d, --dry-run', 'Preview without actually sending')
  .action(async (options) => {
    try {
      let message = options.message;

      if (!message) {
        const { inputMessage } = await inquirer.prompt([
          {
            type: 'editor',
            name: 'inputMessage',
            message: 'Enter your message (use {{name}}, {{firstName}}, etc. for personalization):'
          }
        ]);
        message = inputMessage;
      }

      // Get contacts
      let contacts;
      if (options.group) {
        contacts = contactManager.getContactsByGroup(options.group)
          .filter(c => !c.blacklisted);
      } else if (options.contact) {
        const contact = contactManager.searchContacts(options.contact)[0];
        if (!contact) {
          console.error(chalk.red(`❌ Contact "${options.contact}" not found`));
          return;
        }
        contacts = [contact];
      } else {
        console.error(chalk.red('❌ Please specify --group or --contact'));
        return;
      }

      if (contacts.length === 0) {
        console.log(chalk.yellow('⚠️  No contacts found'));
        return;
      }

      console.log(chalk.blue(`\n📋 Will send to ${contacts.length} contact(s)`));

      // Confirm
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Send custom message to ${contacts.length} contacts?`,
          default: false
        }
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Cancelled'));
        return;
      }

      if (!options.dryRun) {
        console.log(chalk.blue('\n🔌 Connecting to WhatsApp...\n'));
        await whatsappClient.initialize();
        await whatsappClient.waitUntilReady();
      }

      // Parse message for each contact
      const templateParser = (await import('../../templates/parser.js')).default;
      const messages = contacts.map(contact =>
        templateParser.parseForContact(message, contact)
      );

      // Send
      await messageSender.sendBulk(contacts, messages, {
        dryRun: options.dryRun,
        templateName: 'custom'
      });

      if (!options.dryRun) {
        await whatsappClient.disconnect();
      }

    } catch (error) {
      console.error(chalk.red('❌ Failed to send messages:'), error.message);
      logger.error('Custom send failed', { error: error.message });
      process.exit(1);
    }
  });

export default sendCommand;
