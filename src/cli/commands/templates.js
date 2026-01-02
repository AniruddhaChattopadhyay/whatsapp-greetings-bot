import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import templateManager from '../../templates/manager.js';
import logger from '../../utils/logger.js';

const templatesCommand = new Command('templates')
  .description('Manage message templates');

// List templates
templatesCommand
  .command('list')
  .description('List all templates')
  .option('-o, --occasion <name>', 'Filter by occasion')
  .action((options) => {
    try {
      let templates;
      if (options.occasion) {
        templates = templateManager.getTemplatesByOccasion(options.occasion);
      } else {
        templates = templateManager.getAllTemplates();
      }

      if (templates.length === 0) {
        console.log(chalk.yellow('📭 No templates found'));
        return;
      }

      console.log(chalk.blue(`\n📝 Templates (${templates.length})\n`));

      templates.forEach(template => {
        console.log(chalk.bold(template.name));
        console.log(`   ID: ${template.id}`);
        console.log(`   Occasion: ${template.occasion}`);
        console.log(`   Variables: ${template.variables.join(', ') || 'none'}`);
        console.log(chalk.gray('   Preview:'));
        const preview = template.content.split('\n')[0].substring(0, 60);
        console.log(chalk.gray(`   ${preview}...`));
        console.log('');
      });
    } catch (error) {
      console.error(chalk.red('❌ Failed to list templates:'), error.message);
    }
  });

// Show template
templatesCommand
  .command('show')
  .description('Show full template content')
  .argument('<id>', 'Template ID or name')
  .action((id) => {
    try {
      const template = templateManager.getTemplate(id) ||
                       templateManager.getTemplateByName(id);

      if (!template) {
        console.log(chalk.yellow(`⚠️  Template "${id}" not found`));
        return;
      }

      console.log(chalk.blue(`\n📝 ${template.name}\n`));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(template.content);
      console.log(chalk.gray('─'.repeat(60)));
      console.log(`\nOccasion: ${template.occasion}`);
      console.log(`Variables: ${template.variables.join(', ') || 'none'}`);
      console.log(`\n` + chalk.bold('Preview with sample data:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(templateManager.previewTemplate(template.id));
      console.log(chalk.gray('─'.repeat(60)) + '\n');

    } catch (error) {
      console.error(chalk.red('❌ Failed to show template:'), error.message);
    }
  });

// Create template
templatesCommand
  .command('create')
  .description('Create a new template')
  .option('-n, --name <name>', 'Template name')
  .option('-o, --occasion <occasion>', 'Occasion')
  .option('-c, --content <content>', 'Template content')
  .action(async (options) => {
    try {
      let templateData = {};

      if (options.name && options.content) {
        templateData = {
          name: options.name,
          occasion: options.occasion || 'general',
          content: options.content
        };
      } else {
        // Interactive mode
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Template name:',
            validate: input => input.trim() ? true : 'Name is required'
          },
          {
            type: 'list',
            name: 'occasion',
            message: 'Occasion:',
            choices: [
              'new-year',
              'birthday',
              'diwali',
              'christmas',
              'general',
              { name: 'Other (custom)', value: '_custom' }
            ]
          },
          {
            type: 'input',
            name: 'customOccasion',
            message: 'Custom occasion name:',
            when: answers => answers.occasion === '_custom',
            validate: input => input.trim() ? true : 'Occasion is required'
          },
          {
            type: 'editor',
            name: 'content',
            message: 'Template content (use {{name}}, {{firstName}}, etc. for variables):',
            validate: input => input.trim() ? true : 'Content is required'
          }
        ]);

        if (answers.occasion === '_custom') {
          answers.occasion = answers.customOccasion;
        }

        templateData = answers;
      }

      const template = templateManager.createTemplate(templateData);
      console.log(chalk.green(`✅ Template created: ${template.name}`));
      console.log(`   ID: ${template.id}`);
      console.log(`   Variables detected: ${template.variables.join(', ') || 'none'}`);

      logger.info('Template created via CLI', { name: template.name });

    } catch (error) {
      console.error(chalk.red('❌ Failed to create template:'), error.message);
    }
  });

// Edit template
templatesCommand
  .command('edit')
  .description('Edit an existing template')
  .argument('<id>', 'Template ID or name')
  .action(async (id) => {
    try {
      const template = templateManager.getTemplate(id) ||
                       templateManager.getTemplateByName(id);

      if (!template) {
        console.log(chalk.yellow(`⚠️  Template "${id}" not found`));
        return;
      }

      console.log(chalk.blue(`\n📝 Editing: ${template.name}\n`));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Template name:',
          default: template.name
        },
        {
          type: 'input',
          name: 'occasion',
          message: 'Occasion:',
          default: template.occasion
        },
        {
          type: 'editor',
          name: 'content',
          message: 'Template content:',
          default: template.content
        }
      ]);

      templateManager.updateTemplate(template.id, answers);
      console.log(chalk.green(`✅ Template updated: ${template.name}`));

      logger.info('Template updated via CLI', { id: template.id });

    } catch (error) {
      console.error(chalk.red('❌ Failed to edit template:'), error.message);
    }
  });

// Delete template
templatesCommand
  .command('delete')
  .description('Delete a template')
  .argument('<id>', 'Template ID or name')
  .action(async (id) => {
    try {
      const template = templateManager.getTemplate(id) ||
                       templateManager.getTemplateByName(id);

      if (!template) {
        console.log(chalk.yellow(`⚠️  Template "${id}" not found`));
        return;
      }

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Delete template "${template.name}"?`,
          default: false
        }
      ]);

      if (confirm) {
        templateManager.deleteTemplate(template.id);
        console.log(chalk.green(`✅ Deleted ${template.name}`));
        logger.info('Template deleted', { name: template.name });
      } else {
        console.log(chalk.yellow('Cancelled'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Failed to delete template:'), error.message);
    }
  });

// Preview template
templatesCommand
  .command('preview')
  .description('Preview a template with sample data')
  .argument('<id>', 'Template ID or name')
  .action((id) => {
    try {
      const template = templateManager.getTemplate(id) ||
                       templateManager.getTemplateByName(id);

      if (!template) {
        console.log(chalk.yellow(`⚠️  Template "${id}" not found`));
        return;
      }

      console.log(chalk.blue(`\n📝 ${template.name}\n`));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(templateManager.previewTemplate(template.id));
      console.log(chalk.gray('─'.repeat(60)) + '\n');

    } catch (error) {
      console.error(chalk.red('❌ Failed to preview template:'), error.message);
    }
  });

// Reset to defaults
templatesCommand
  .command('reset')
  .description('Reset templates to defaults')
  .action(async () => {
    try {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'This will delete all custom templates and restore defaults. Continue?',
          default: false
        }
      ]);

      if (confirm) {
        templateManager.resetToDefaults();
        console.log(chalk.green('✅ Templates reset to defaults'));
        logger.info('Templates reset to defaults');
      } else {
        console.log(chalk.yellow('Cancelled'));
      }

    } catch (error) {
      console.error(chalk.red('❌ Failed to reset templates:'), error.message);
    }
  });

export default templatesCommand;
