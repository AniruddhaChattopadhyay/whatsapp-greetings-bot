# WhatsApp Greetings Bot - Project Plan

## Overview
An open-source WhatsApp bot for sending personalized greeting messages to multiple contacts on special occasions like New Year, birthdays, festivals, etc. Built for personal use without requiring paid services.

## Technology Stack
- **Runtime**: Node.js (v18+)
- **Core Library**: whatsapp-web.js (connects to WhatsApp Web via Puppeteer)
- **CLI Framework**: Commander.js + Inquirer.js
- **Scheduling**: node-cron
- **Logging**: Winston
- **Data Storage**: JSON files
- **License**: MIT

## Core Features

### Phase 1: Core Functionality (MVP)

#### 1. WhatsApp Connection
- [x] QR code authentication (scan with WhatsApp mobile app)
- [x] Session persistence (automatic re-login)
- [x] Connection status monitoring
- [x] Graceful disconnection handling

#### 2. Contact Management
- [x] Import contacts from CSV/JSON file
- [x] Group contacts by categories (family, friends, colleagues, etc.)
- [x] Contact validation (verify if number exists on WhatsApp)
- [x] Add/edit/delete contacts via CLI
- [x] Contact list export

#### 3. Message Sending
- [x] Send personalized messages with variable substitution
- [x] Support for emojis and WhatsApp formatting (*bold*, _italic_, ~strikethrough~)
- [x] Bulk message sending with smart delays
- [x] Random delays between messages (30-60 seconds default)
- [x] Progress tracking during bulk send
- [x] Dry-run mode (test without actually sending)

#### 4. Message Templates
- [x] Pre-defined templates for common occasions
  - New Year
  - Birthday
  - Diwali
  - Christmas
  - Generic greetings
- [x] Custom template creation and editing
- [x] Variable substitution: `{{name}}`, `{{firstName}}`, `{{customField}}`
- [x] Template preview with sample data

#### 5. Safety Features
- [x] Rate limiting to avoid WhatsApp bans
- [x] Configurable delays between messages
- [x] Daily message limits
- [x] Blacklist (exclude specific contacts)
- [x] Retry mechanism for failed messages

#### 6. Logging & Tracking
- [x] Activity logs (timestamp, recipient, status)
- [x] Failed message tracking
- [x] Delivery status monitoring
- [x] Export logs to CSV
- [x] Console progress display

### Phase 2: Enhanced Features

#### 7. Scheduling
- [ ] Schedule messages for specific date/time
- [ ] Timezone support
- [ ] Recurring greetings (annual birthdays, anniversaries)
- [ ] Reminder notifications before scheduled sends

#### 8. Media Support
- [ ] Send images with greetings
- [ ] Support for GIFs and stickers
- [ ] Attach documents (PDFs, etc.)
- [ ] Multiple media attachments per message

#### 9. Advanced Templates
- [ ] Multi-language template support
- [ ] Conditional content (e.g., different message based on group)
- [ ] Template variables from CSV columns
- [ ] Rich text formatting preview

#### 10. Analytics
- [ ] Message delivery statistics
- [ ] Response rate tracking
- [ ] Most used templates report
- [ ] Monthly/yearly usage summaries

### Phase 3: User Experience Enhancements

#### 11. Improved CLI
- [ ] Interactive wizard for first-time setup
- [ ] Better error messages and help text
- [ ] Command history and autocomplete
- [ ] Configuration validation

#### 12. Web Dashboard (Optional)
- [ ] Simple web UI for non-technical users
- [ ] Visual template editor
- [ ] Contact management interface
- [ ] Real-time sending status

## Project Structure

```
greetings-bot-whatsapp/
├── src/
│   ├── bot/
│   │   ├── client.js          # WhatsApp client initialization
│   │   ├── sender.js          # Message sending logic with rate limiting
│   │   └── scheduler.js       # Scheduling functionality (Phase 2)
│   ├── contacts/
│   │   ├── manager.js         # Contact CRUD operations
│   │   └── validator.js       # Phone number & WhatsApp validation
│   ├── templates/
│   │   ├── manager.js         # Template CRUD operations
│   │   └── parser.js          # Variable substitution engine
│   ├── utils/
│   │   ├── logger.js          # Winston logging configuration
│   │   ├── config.js          # Configuration management
│   │   ├── delay.js           # Smart delay generator
│   │   └── csvParser.js       # CSV import/export utilities
│   └── cli/
│       ├── index.js           # Main CLI entry point
│       ├── commands/          # CLI command handlers
│       │   ├── send.js
│       │   ├── contacts.js
│       │   ├── templates.js
│       │   └── config.js
│       └── prompts.js         # Interactive prompts
├── data/
│   ├── contacts.json          # Contact list (gitignored)
│   ├── templates.json         # Message templates
│   ├── session/               # WhatsApp session data (gitignored)
│   └── logs/                  # Activity logs (gitignored)
├── config/
│   ├── default.json           # Default configuration
│   └── custom.json            # User overrides (gitignored)
├── examples/
│   ├── contacts.example.csv   # Sample contact list format
│   └── templates.example.json # Sample templates
├── .gitignore
├── .env.example
├── package.json
├── package-lock.json
├── README.md
├── PROJECT_PLAN.md
├── CONTRIBUTING.md
├── LICENSE
└── SECURITY.md
```

## Configuration System

### config/default.json
```json
{
  "whatsapp": {
    "sessionPath": "./data/session",
    "puppeteerOptions": {
      "headless": true,
      "args": ["--no-sandbox"]
    }
  },
  "delays": {
    "minDelay": 30000,        // 30 seconds between messages
    "maxDelay": 60000,        // 60 seconds between messages
    "randomize": true         // Add randomness to appear human
  },
  "limits": {
    "dailyLimit": 100,        // Max messages per day
    "enabled": true,
    "resetHour": 0            // Reset counter at midnight
  },
  "retries": {
    "maxAttempts": 3,
    "backoffMultiplier": 2,
    "enabled": true
  },
  "logging": {
    "level": "info",
    "file": "./data/logs/app.log",
    "maxSize": "10m",
    "maxFiles": 5
  }
}
```

## Contact Data Format

### contacts.json
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+919876543210",
      "group": "friends",
      "customFields": {
        "nickname": "Johnny"
      },
      "blacklisted": false,
      "lastSent": "2025-01-01T00:00:00Z"
    }
  ],
  "groups": ["family", "friends", "colleagues", "relatives"]
}
```

### CSV Import Format
```csv
name,phone,group,customField1
John Doe,+919876543210,friends,Johnny
Jane Smith,+919876543211,family,Janey
```

## Template Format

### templates.json
```json
{
  "templates": [
    {
      "id": "new-year-2026",
      "name": "New Year 2026",
      "occasion": "new-year",
      "content": "Happy New Year {{name}}! 🎉\n\nWishing you a fantastic 2026 filled with joy, success, and amazing memories!",
      "variables": ["name"],
      "createdAt": "2025-12-15T00:00:00Z"
    }
  ]
}
```

## CLI Commands

### Basic Commands
```bash
# Initialize and authenticate
npm start init

# Send messages
npm start send --template "new-year-2026" --group "friends"
npm start send --template "birthday" --contact "John Doe"
npm start send --dry-run  # Test without sending

# Manage contacts
npm start contacts list
npm start contacts add
npm start contacts import contacts.csv
npm start contacts export

# Manage templates
npm start templates list
npm start templates create
npm start templates edit "new-year-2026"

# View logs
npm start logs --date "2026-01-01"
npm start logs --failed

# Configuration
npm start config show
npm start config set delays.minDelay 45000
```

## Safety & Anti-Ban Measures

1. **Smart Delays**: Random delays between 30-60 seconds (configurable)
2. **Daily Limits**: Default 100 messages/day (adjustable)
3. **Human-like Patterns**: Randomized timing, avoid perfect intervals
4. **Gradual Ramp-up**: Start slow, increase gradually over days
5. **Retry Logic**: Exponential backoff for failed messages
6. **Session Management**: Stable connection with proper cleanup

## Ethical Guidelines & Disclaimer

### For Users
- **Get Consent**: Only send messages to people who expect to hear from you
- **Respect Privacy**: Don't share or sell contact lists
- **No Spam**: Use for personal greetings only, not commercial promotion
- **WhatsApp ToS**: Users are responsible for compliance with WhatsApp Terms of Service
- **Rate Limits**: Respect the built-in safety limits
- **Opt-out**: Honor requests to stop receiving messages

### For Contributors
- Maintain privacy-first approach
- Don't add features that enable spam
- Document safety implications of new features
- Follow secure coding practices

## Security Considerations

1. **Data Protection**
   - Session data stored locally only
   - Contacts file in .gitignore
   - No data sent to external servers
   - Encryption option for sensitive files (Phase 2)

2. **Access Control**
   - File system permissions
   - No web exposure by default
   - Secure credential handling

3. **Dependencies**
   - Regular security audits (`npm audit`)
   - Pin major versions
   - Review updates before merging

## Development Roadmap

### Milestone 1: MVP (Week 1-2)
- [x] Project setup
- [x] WhatsApp authentication
- [x] Basic contact management
- [x] Template system
- [x] Manual message sending
- [x] Basic logging

### Milestone 2: Bulk Operations (Week 3)
- [x] Bulk sending with delays
- [x] CSV import/export
- [x] Dry-run mode
- [x] Progress tracking
- [x] Error handling

### Milestone 3: Polish (Week 4)
- [ ] Comprehensive CLI
- [ ] Configuration management
- [ ] Documentation
- [ ] Example files
- [ ] Testing

### Milestone 4: Advanced Features (Future)
- [ ] Scheduling
- [ ] Media support
- [ ] Web dashboard
- [ ] Analytics

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Areas Needing Help
- Testing on different platforms
- Additional message templates
- Localization
- Documentation improvements
- Bug reports and fixes

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is for personal use only. Users are responsible for:
- Complying with WhatsApp Terms of Service
- Obtaining consent from message recipients
- Using the tool ethically and legally
- Any consequences of misuse

The developers are not responsible for WhatsApp account bans or other consequences resulting from use of this tool.

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: README.md and Wiki

## Acknowledgments

- Built with [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- Inspired by the need for personal, ethical bulk messaging solutions
