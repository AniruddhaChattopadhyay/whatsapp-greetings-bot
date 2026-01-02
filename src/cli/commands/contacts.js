import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import contactManager from '../../contacts/manager.js';
import logger from '../../utils/logger.js';

const contactsCommand = new Command('contacts')
  .description('Manage contacts');

// List contacts
contactsCommand
  .command('list')
  .description('List all contacts')
  .option('-g, --group <name>', 'Filter by group')
  .option('-a, --all', 'Show all including blacklisted')
  .action((options) => {
    try {
      let contacts;
      if (options.group) {
        contacts = contactManager.getContactsByGroup(options.group);
      } else if (options.all) {
        contacts = contactManager.getAllContacts();
      } else {
        contacts = contactManager.getActiveContacts();
      }

      if (contacts.length === 0) {
        console.log(chalk.yellow('📭 No contacts found'));
        return;
      }

      console.log(chalk.blue(`\n📇 Contacts (${contacts.length})\n`));

      contacts.forEach(contact => {
        const status = contact.blacklisted ? chalk.red('[BLOCKED]') : chalk.green('[ACTIVE]');
        console.log(`${status} ${chalk.bold(contact.name)}`);
        console.log(`   📱 ${contact.phone}`);
        console.log(`   👥 ${contact.group}`);
        if (contact.lastSent) {
          console.log(`   📤 Last sent: ${new Date(contact.lastSent).toLocaleString()}`);
        }
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to list contacts:'), error.message);
    }
  });

// Add contact
contactsCommand
  .command('add')
  .description('Add a new contact')
  .option('-n, --name <name>', 'Contact name')
  .option('-p, --phone <phone>', 'Phone number')
  .option('-g, --group <group>', 'Group name')
  .action(async (options) => {
    try {
      let contactData = {};

      if (options.name && options.phone) {
        contactData = {
          name: options.name,
          phone: options.phone,
          group: options.group || 'friends'
        };
      } else {
        // Interactive mode
        const groups = contactManager.getGroups();
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Contact name:',
            validate: input => input.trim() ? true : 'Name is required'
          },
          {
            type: 'input',
            name: 'phone',
            message: 'Phone number (with country code):',
            validate: input => input.trim() ? true : 'Phone is required'
          },
          {
            type: 'list',
            name: 'group',
            message: 'Group:',
            choices: [...groups, { name: '+ Create new group', value: '_new' }]
          }
        ]);

        if (answers.group === '_new') {
          const { newGroup } = await inquirer.prompt([
            {
              type: 'input',
              name: 'newGroup',
              message: 'New group name:',
              validate: input => input.trim() ? true : 'Group name is required'
            }
          ]);
          contactManager.addGroup(newGroup);
          answers.group = newGroup;
        }

        contactData = answers;
      }

      const contact = contactManager.addContact(contactData);
      console.log(chalk.green(`✅ Contact added: ${contact.name}`));
      logger.info('Contact added via CLI', { contact: contact.name });

    } catch (error) {
      console.error(chalk.red('❌ Failed to add contact:'), error.message);
    }
  });

// Import from CSV
contactsCommand
  .command('import')
  .description('Import contacts from CSV file')
  .argument('<file>', 'CSV file path')
  .action(async (file) => {
    try {
      if (!fs.existsSync(file)) {
        console.error(chalk.red(`❌ File not found: ${file}`));
        return;
      }

      const csvData = fs.readFileSync(file, 'utf8');
      const result = contactManager.importFromCSV(csvData);

      console.log(chalk.green(`✅ Imported ${result.imported.length} contacts`));

      if (result.failed.length > 0) {
        console.log(chalk.yellow(`⚠️  ${result.failed.length} contacts failed to import:`));
        result.failed.forEach(f => {
          console.log(chalk.red(`   Line ${f.line}: ${f.error}`));
        });
      }

      logger.info('CSV import completed', {
        imported: result.imported.length,
        failed: result.failed.length
      });

    } catch (error) {
      console.error(chalk.red('❌ Failed to import:'), error.message);
    }
  });

// Export to CSV
contactsCommand
  .command('export')
  .description('Export contacts to CSV file')
  .argument('<file>', 'Output CSV file path')
  .action((file) => {
    try {
      const csv = contactManager.exportToCSV();
      if (!csv) {
        console.log(chalk.yellow('⚠️  No contacts to export'));
        return;
      }

      fs.writeFileSync(file, csv, 'utf8');
      console.log(chalk.green(`✅ Contacts exported to ${file}`));
      logger.info('Contacts exported', { file });

    } catch (error) {
      console.error(chalk.red('❌ Failed to export:'), error.message);
    }
  });

// Delete contact
contactsCommand
  .command('delete')
  .description('Delete a contact')
  .argument('<name>', 'Contact name or phone')
  .action(async (name) => {
    try {
      const contacts = contactManager.searchContacts(name);

      if (contacts.length === 0) {
        console.log(chalk.yellow(`⚠️  No contact found matching "${name}"`));
        return;
      }

      let contact;
      if (contacts.length === 1) {
        contact = contacts[0];
      } else {
        const { selected } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selected',
            message: 'Multiple contacts found. Select one:',
            choices: contacts.map(c => ({
              name: `${c.name} (${c.phone})`,
              value: c.id
            }))
          }
        ]);
        contact = contactManager.getContact(selected);
      }

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Delete ${contact.name} (${contact.phone})?`,
          default: false
        }
      ]);

      if (confirm) {
        contactManager.deleteContact(contact.id);
        console.log(chalk.green(`✅ Deleted ${contact.name}`));
        logger.info('Contact deleted', { name: contact.name });
      } else {
        console.log(chalk.yellow('Cancelled'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Failed to delete contact:'), error.message);
    }
  });

// Blacklist contact
contactsCommand
  .command('blacklist')
  .description('Blacklist or unblacklist a contact')
  .argument('<name>', 'Contact name or phone')
  .option('-u, --unblock', 'Unblock the contact')
  .action(async (name, options) => {
    try {
      const contacts = contactManager.searchContacts(name);

      if (contacts.length === 0) {
        console.log(chalk.yellow(`⚠️  No contact found matching "${name}"`));
        return;
      }

      const contact = contacts[0];
      const blacklisted = !options.unblock;

      contactManager.blacklistContact(contact.id, blacklisted);

      if (blacklisted) {
        console.log(chalk.green(`✅ Blacklisted ${contact.name}`));
      } else {
        console.log(chalk.green(`✅ Unblocked ${contact.name}`));
      }

      logger.info('Contact blacklist status changed', {
        name: contact.name,
        blacklisted
      });

    } catch (error) {
      console.error(chalk.red('❌ Failed to update contact:'), error.message);
    }
  });

// Stats
contactsCommand
  .command('stats')
  .description('Show contact statistics')
  .action(() => {
    try {
      const stats = contactManager.getStats();

      console.log(chalk.blue('\n📊 Contact Statistics\n'));
      console.log(`Total contacts: ${stats.total}`);
      console.log(`Active: ${chalk.green(stats.active)}`);
      console.log(`Blacklisted: ${chalk.red(stats.blacklisted)}`);

      console.log('\n' + chalk.bold('By Group:'));
      Object.entries(stats.byGroup).forEach(([group, count]) => {
        console.log(`  ${group}: ${count}`);
      });
      console.log('');

    } catch (error) {
      console.error(chalk.red('❌ Failed to get stats:'), error.message);
    }
  });

export default contactsCommand;
