# WhatsApp Greetings Bot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

An open-source WhatsApp bot for sending personalized greeting messages to multiple contacts on special occasions like New Year, birthdays, festivals, and more. Built for personal use without requiring paid services.

## Features

- **Easy WhatsApp Integration**: Connect via QR code scanning (like WhatsApp Web)
- **Contact Management**: Import from CSV, organize by groups, add/edit/delete contacts
- **Message Templates**: Pre-built templates for common occasions with variable substitution
- **Bulk Messaging**: Send personalized messages to multiple contacts with smart delays
- **Rate Limiting**: Built-in safety features to avoid WhatsApp bans
- **Activity Logging**: Track sent messages, delivery status, and failures
- **Dry Run Mode**: Test your messages without actually sending them
- **CLI Interface**: Easy-to-use command-line interface

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Initialize WhatsApp](#initialize-whatsapp)
  - [Managing Contacts](#managing-contacts)
  - [Managing Templates](#managing-templates)
  - [Sending Messages](#sending-messages)
  - [Configuration](#configuration)
  - [Viewing Logs](#viewing-logs)
- [Safety Features](#safety-features)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Disclaimer](#disclaimer)

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/greetings-bot-whatsapp.git
cd greetings-bot-whatsapp
```

2. Install dependencies:
```bash
npm install
```

3. The bot is now ready to use!

## Quick Start

### 1. Initialize and Connect to WhatsApp

```bash
npm start init
```

This will display a QR code. Scan it with your WhatsApp mobile app:
- Open WhatsApp on your phone
- Go to Settings > Linked Devices
- Tap "Link a Device"
- Scan the QR code

### 2. Add Some Contacts

Create a CSV file with your contacts (see [examples/contacts.example.csv](examples/contacts.example.csv)):

```csv
name,phone,group
John Doe,+919876543210,friends
Jane Smith,+919876543211,family
```

Import the contacts:
```bash
npm start contacts import contacts.csv
```

### 3. Send Your First Message

```bash
npm start send template --template "new-year-2026" --group "friends"
```

Or try a dry run first (won't actually send):
```bash
npm start send template --template "new-year-2026" --group "friends" --dry-run
```

## Usage

### Initialize WhatsApp

Connect to WhatsApp (required before sending messages):
```bash
npm start init
```

### Managing Contacts

#### List all contacts
```bash
npm start contacts list
```

#### Add a contact interactively
```bash
npm start contacts add
```

#### Add a contact with command-line options
```bash
npm start contacts add --name "John Doe" --phone "+919876543210" --group "friends"
```

#### Import contacts from CSV
```bash
npm start contacts import contacts.csv
```

CSV format:
```csv
name,phone,group,nickname
John Doe,+919876543210,friends,Johnny
Jane Smith,+919876543211,family,Janey
```

#### Export contacts to CSV
```bash
npm start contacts export contacts-backup.csv
```

#### Delete a contact
```bash
npm start contacts delete "John Doe"
```

#### Blacklist a contact (prevent sending messages)
```bash
npm start contacts blacklist "John Doe"
```

#### Unblock a blacklisted contact
```bash
npm start contacts blacklist "John Doe" --unblock
```

#### View contact statistics
```bash
npm start contacts stats
```

### Managing Templates

#### List all templates
```bash
npm start templates list
```

#### Show a specific template
```bash
npm start templates show new-year-2026
```

#### Create a new template interactively
```bash
npm start templates create
```

#### Create a template with command-line options
```bash
npm start templates create --name "Easter Greetings" --occasion "easter" --content "Happy Easter {{name}}! 🐰"
```

Templates support variables:
- `{{name}}` - Full name
- `{{firstName}}` - First name only
- `{{lastName}}` - Last name only
- `{{phone}}` - Phone number
- `{{group}}` - Contact group
- Any custom fields from your CSV

#### Edit a template
```bash
npm start templates edit new-year-2026
```

#### Preview a template
```bash
npm start templates preview birthday-wishes
```

#### Delete a template
```bash
npm start templates delete custom-template
```

### Sending Messages

#### Send using a template to a specific group
```bash
npm start send template --template "new-year-2026" --group "friends"
```

#### Send to a specific contact
```bash
npm start send template --template "birthday-wishes" --contact "John Doe"
```

#### Send to all active contacts
```bash
npm start send template --template "diwali-greetings" --all
```

#### Dry run (preview without sending)
```bash
npm start send template --template "new-year-2026" --group "friends" --dry-run
```

#### Send a custom message
```bash
npm start send custom --message "Hello {{name}}, this is a custom message!" --group "friends"
```

#### Interactive mode (select template and recipients)
```bash
npm start send template
```

### Configuration

#### Show current configuration
```bash
npm start config show
```

#### Get a specific config value
```bash
npm start config get delays.minDelay
```

#### Set a config value
```bash
npm start config set delays.minDelay 45000
npm start config set limits.dailyLimit 200
```

#### Reset to default configuration
```bash
npm start config reset
```

#### Key configuration options:

- `delays.minDelay` - Minimum delay between messages (ms, default: 30000)
- `delays.maxDelay` - Maximum delay between messages (ms, default: 60000)
- `delays.randomize` - Use random delays (default: true)
- `limits.dailyLimit` - Max messages per day (default: 100)
- `limits.enabled` - Enable rate limiting (default: true)
- `retries.maxAttempts` - Max retry attempts for failed messages (default: 3)

### Viewing Logs

#### View recent activity logs
```bash
npm start logs
```

#### View logs for a specific date
```bash
npm start logs --date "2026-01-01"
```

#### View only failed messages
```bash
npm start logs --failed
```

#### Export logs to CSV
```bash
npm start logs --export activity.csv
```

### Check Bot Status

```bash
npm start status
```

Shows:
- WhatsApp connection status
- Contact statistics
- Template count
- Rate limit information

## Safety Features

The bot includes several safety mechanisms to prevent WhatsApp from banning your account:

1. **Smart Delays**: Random delays between 30-60 seconds (configurable) between messages
2. **Rate Limiting**: Maximum 100 messages per day by default (configurable)
3. **Human-like Patterns**: Randomized timing to avoid detection
4. **Retry Logic**: Automatic retry with exponential backoff for failed messages
5. **Dry Run Mode**: Test your campaigns without actually sending
6. **Blacklist Support**: Exclude specific contacts from bulk sends

### Recommended Practices:

- Start with small batches (10-20 contacts)
- Use longer delays (45-60 seconds) when sending to many contacts
- Avoid sending messages late at night
- Don't exceed 100-150 messages per day
- Only send to people who expect to hear from you
- Test with dry-run mode first

## Project Structure

```
greetings-bot-whatsapp/
├── src/
│   ├── bot/
│   │   ├── client.js          # WhatsApp client
│   │   └── sender.js          # Message sending logic
│   ├── contacts/
│   │   └── manager.js         # Contact management
│   ├── templates/
│   │   ├── manager.js         # Template management
│   │   └── parser.js          # Variable substitution
│   ├── utils/
│   │   ├── config.js          # Configuration
│   │   ├── logger.js          # Logging
│   │   └── delay.js           # Rate limiting
│   └── cli/
│       ├── index.js           # CLI entry point
│       └── commands/          # CLI commands
├── data/
│   ├── contacts.json          # Your contacts (gitignored)
│   ├── templates.json         # Message templates
│   ├── session/               # WhatsApp session (gitignored)
│   └── logs/                  # Activity logs (gitignored)
├── config/
│   └── default.json           # Default configuration
├── examples/
│   └── contacts.example.csv   # Example contact CSV
├── PROJECT_PLAN.md            # Detailed project plan
└── README.md
```

## Troubleshooting

### QR Code Not Appearing
- Make sure you're using Node.js >= 18.0.0
- Try running with `--headless=false` if you want to see the browser
- Check if port 3000 is available

### Messages Not Sending
- Ensure you've run `npm start init` and scanned the QR code
- Check if WhatsApp Web is disconnected on your phone
- Verify the phone numbers are in correct format with country code
- Check logs with `npm start logs --failed`

### WhatsApp Account Banned
- Reduce the number of messages per day
- Increase delays between messages
- Only send to contacts who expect messages from you
- Avoid using this for commercial/spam purposes

### Session Expired
- Delete the `data/session` directory
- Run `npm start init` again to reconnect

## Contributing

Contributions are welcome! Please see [PROJECT_PLAN.md](PROJECT_PLAN.md) for the roadmap and feature ideas.

### How to Contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Areas Needing Help:
- Additional message templates
- Testing on different platforms (Windows, Linux, macOS)
- Documentation improvements
- Bug reports and fixes
- New features from the roadmap

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ **Important Legal Notice**

This tool is intended for **personal use only**. Users are responsible for:

- Complying with WhatsApp's Terms of Service
- Obtaining consent from message recipients
- Using the tool ethically and responsibly
- Following local laws and regulations regarding automated messaging

**The developers are NOT responsible for:**
- WhatsApp account bans or restrictions
- Any misuse of this tool
- Spam or unwanted messages sent using this bot
- Any legal consequences resulting from misuse

**Please use responsibly and ethically.** Only send messages to people who know you and expect to hear from you. This tool is not intended for commercial use, spam, or mass marketing.

## Acknowledgments

- Built with [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - awesome WhatsApp Web API
- Inspired by the need for ethical, personal bulk messaging solutions

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/greetings-bot-whatsapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/greetings-bot-whatsapp/discussions)

---

Made with ❤️ for sending warm wishes to friends and family
