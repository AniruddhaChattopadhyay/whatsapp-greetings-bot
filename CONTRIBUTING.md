# Contributing to WhatsApp Greetings Bot

Thank you for your interest in contributing to the WhatsApp Greetings Bot! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project is intended to help people send warm greetings to friends and family. We expect all contributors to:

- Be respectful and inclusive
- Focus on ethical use cases
- Not add features that enable spam or abuse
- Document safety implications of new features
- Follow responsible disclosure for security issues

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, Node.js version, etc.)
- **Logs** if applicable (remove sensitive data)

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature already exists or is planned (see [PROJECT_PLAN.md](PROJECT_PLAN.md))
- Explain the use case clearly
- Consider safety and ethical implications
- Be open to discussion about implementation

### Areas Needing Help

- **Testing**: Test on different platforms (Windows, Linux, macOS)
- **Templates**: Add message templates for different occasions/cultures
- **Documentation**: Improve guides, add examples, fix typos
- **Localization**: Translate documentation to other languages
- **Bug Fixes**: Fix issues from the issue tracker
- **Features**: Implement features from the roadmap

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Setup Steps

1. Fork the repository on GitHub

2. Clone your fork:
```bash
git clone https://github.com/YOUR-USERNAME/greetings-bot-whatsapp.git
cd greetings-bot-whatsapp
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/ORIGINAL-OWNER/greetings-bot-whatsapp.git
```

4. Install dependencies:
```bash
npm install
```

5. Create a branch for your changes:
```bash
git checkout -b feature/your-feature-name
```

### Running Locally

```bash
# Run the bot
npm start

# Run with auto-reload during development
npm run dev
```

### Testing Your Changes

Before submitting a PR, please:

1. Test your changes thoroughly
2. Use `--dry-run` mode for message sending features
3. Test on your platform (mention in PR which OS you tested on)
4. Check that existing functionality still works

## Project Structure

```
greetings-bot-whatsapp/
├── src/
│   ├── bot/           # WhatsApp client and message sender
│   ├── contacts/      # Contact management
│   ├── templates/     # Template system
│   ├── utils/         # Utilities (config, logging, delays)
│   └── cli/           # CLI interface and commands
├── data/              # Runtime data (gitignored)
├── config/            # Configuration files
├── examples/          # Example files
└── docs/              # Additional documentation
```

## Coding Guidelines

### JavaScript Style

- Use ES6+ features (async/await, destructuring, etc.)
- Use `import`/`export` (ES modules)
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Descriptive variable names

### Best Practices

1. **Error Handling**: Always handle errors gracefully
   ```javascript
   try {
     // Your code
   } catch (error) {
     logger.error('Clear error message', { context });
     console.error(chalk.red('User-friendly message'));
   }
   ```

2. **Logging**: Use the logger for important events
   ```javascript
   logger.info('Event description', { relevant: 'data' });
   ```

3. **Configuration**: Use the config system for configurable values
   ```javascript
   const delay = config.get('delays.minDelay');
   ```

4. **User Feedback**: Provide clear console output
   ```javascript
   console.log(chalk.green('✅ Success message'));
   console.log(chalk.yellow('⚠️  Warning message'));
   console.error(chalk.red('❌ Error message'));
   ```

### Safety Considerations

When adding features that interact with WhatsApp:

- **Rate Limiting**: Respect existing rate limits
- **Delays**: Add appropriate delays between actions
- **User Consent**: Ensure features promote ethical use
- **Documentation**: Document safety implications

### Adding New Commands

1. Create command file in `src/cli/commands/`
2. Follow existing command structure
3. Import and register in `src/cli/index.js`
4. Add documentation to README.md
5. Add examples

Example command structure:
```javascript
import { Command } from 'commander';
import chalk from 'chalk';

const myCommand = new Command('mycommand')
  .description('Description of command');

myCommand
  .command('subcommand')
  .description('Description')
  .option('-f, --flag', 'Option description')
  .action(async (options) => {
    try {
      // Implementation
      console.log(chalk.green('✅ Success'));
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error.message);
    }
  });

export default myCommand;
```

## Commit Messages

Use clear, descriptive commit messages:

```
type: brief description

Longer description if needed

Fixes #issue-number
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat: add scheduling support for messages

fix: handle phone numbers without country code

docs: update installation instructions
```

## Pull Request Process

1. **Update Documentation**: Update README.md and other docs as needed

2. **Test Your Changes**: Ensure everything works

3. **Commit Your Changes**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push to Your Fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**:
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

6. **PR Description Should Include**:
   - What changes were made
   - Why the changes were made
   - How to test the changes
   - Any breaking changes
   - Screenshots/examples if applicable

7. **Respond to Feedback**: Be open to suggestions and discussions

### PR Review Process

- Maintainers will review your PR
- You may be asked to make changes
- Once approved, your PR will be merged
- Your contribution will be credited

## Development Tips

### Debugging

Enable debug logging:
```bash
npm start config set logging.level debug
```

### Testing WhatsApp Features

- Use `--dry-run` flag to test without sending
- Test with a small number of contacts first
- Use your own phone number for initial tests

### Common Issues

**Session not persisting**:
- Check `data/session` directory exists
- Ensure write permissions

**Messages not sending**:
- Verify WhatsApp connection with `npm start status`
- Check logs with `npm start logs --failed`

## Questions?

- Open an issue with the `question` label
- Check existing issues and discussions
- Review the [PROJECT_PLAN.md](PROJECT_PLAN.md)

## Recognition

Contributors will be:
- Listed in the project contributors
- Credited in release notes for significant contributions
- Mentioned in the README (for major features)

Thank you for contributing to making this project better!
