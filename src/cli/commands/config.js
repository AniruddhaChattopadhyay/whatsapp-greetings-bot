import { Command } from 'commander';
import chalk from 'chalk';
import config from '../../utils/config.js';
import logger from '../../utils/logger.js';

const configCommand = new Command('config')
  .description('Manage bot configuration');

// Show config
configCommand
  .command('show')
  .description('Show current configuration')
  .action(() => {
    try {
      const currentConfig = config.getAll();

      console.log(chalk.blue('\n⚙️  Current Configuration\n'));
      console.log(JSON.stringify(currentConfig, null, 2));
      console.log('');

    } catch (error) {
      console.error(chalk.red('❌ Failed to show config:'), error.message);
    }
  });

// Get config value
configCommand
  .command('get')
  .description('Get a configuration value')
  .argument('<key>', 'Configuration key (e.g., delays.minDelay)')
  .action((key) => {
    try {
      const value = config.get(key);

      if (value === undefined) {
        console.log(chalk.yellow(`⚠️  Key "${key}" not found`));
        return;
      }

      console.log(chalk.blue(`\n${key}:`), JSON.stringify(value, null, 2), '\n');

    } catch (error) {
      console.error(chalk.red('❌ Failed to get config:'), error.message);
    }
  });

// Set config value
configCommand
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', 'Configuration key (e.g., delays.minDelay)')
  .argument('<value>', 'New value')
  .action((key, value) => {
    try {
      // Try to parse as JSON, fallback to string
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }

      config.set(key, parsedValue);
      console.log(chalk.green(`✅ Set ${key} = ${JSON.stringify(parsedValue)}`));
      logger.info('Config updated', { key, value: parsedValue });

    } catch (error) {
      console.error(chalk.red('❌ Failed to set config:'), error.message);
    }
  });

// Reset config
configCommand
  .command('reset')
  .description('Reset configuration to defaults')
  .action(() => {
    try {
      config.reset();
      console.log(chalk.green('✅ Configuration reset to defaults'));
      logger.info('Config reset to defaults');

    } catch (error) {
      console.error(chalk.red('❌ Failed to reset config:'), error.message);
    }
  });

export default configCommand;
