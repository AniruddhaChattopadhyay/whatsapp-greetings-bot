# Quick Start Guide

Get your WhatsApp Greetings Bot up and running in 5 minutes!

## Step 1: Initial Setup (1 minute)

The dependencies are already installed! Just verify everything is ready:

```bash
npm start status
```

## Step 2: Connect to WhatsApp (2 minutes)

Initialize and authenticate with WhatsApp:

```bash
npm start init
```

A QR code will appear in your terminal. Using your phone:
1. Open WhatsApp
2. Go to **Settings** → **Linked Devices**
3. Tap **Link a Device**
4. Scan the QR code

You should see "✅ WhatsApp client is ready!" when connected.

## Step 3: Add Contacts (1 minute)

### Option A: Quick Add (Single Contact)

```bash
npm start contacts add
```

Follow the interactive prompts to add a contact.

### Option B: Bulk Import (Multiple Contacts)

1. Create a CSV file named `my-contacts.csv`:
```csv
name,phone,group
John Doe,+919876543210,friends
Jane Smith,+919876543211,family
```

2. Import it:
```bash
npm start contacts import my-contacts.csv
```

**Note**: Use full phone numbers with country code (e.g., +91 for India)

## Step 4: Send Your First Message (1 minute)

### Try a Dry Run First (Recommended)

Test without actually sending:

```bash
npm start send template --template "generic-greeting" --group "friends" --dry-run
```

This shows you what would be sent without sending anything.

### Send for Real

When ready, send actual messages:

```bash
npm start send template --template "generic-greeting" --group "friends"
```

The bot will:
- Show a preview of the template
- Ask for confirmation
- Connect to WhatsApp
- Send messages with smart delays between each

## Available Templates

The bot comes with these pre-built templates:
- `new-year-2026` - New Year greetings
- `birthday-wishes` - Birthday wishes
- `diwali-greetings` - Diwali greetings
- `christmas-wishes` - Christmas greetings
- `generic-greeting` - General hello message

View all templates:
```bash
npm start templates list
```

Preview a template:
```bash
npm start templates show new-year-2026
```

## Common Commands

### Contacts Management
```bash
# List all contacts
npm start contacts list

# View statistics
npm start contacts stats

# Export contacts backup
npm start contacts export backup.csv
```

### Sending Messages
```bash
# Send to a specific group
npm start send template -t "new-year-2026" -g "friends"

# Send to one person
npm start send template -t "birthday-wishes" -c "John Doe"

# Send to everyone
npm start send template -t "diwali-greetings" -a

# Always test first with --dry-run!
npm start send template -t "new-year-2026" -g "friends" --dry-run
```

### Templates
```bash
# Create new template
npm start templates create

# Edit existing template
npm start templates edit new-year-2026

# Preview template
npm start templates preview birthday-wishes
```

### Logs and Status
```bash
# Check connection status
npm start status

# View recent activity
npm start logs

# View only failed messages
npm start logs --failed

# Export logs
npm start logs --export activity.csv
```

## Tips for Success

### 1. Start Small
- Test with 2-3 contacts first
- Use `--dry-run` mode initially
- Verify messages look correct before sending

### 2. Personalize Messages
Templates support these variables:
- `{{name}}` - Full name (e.g., "John Doe")
- `{{firstName}}` - First name only (e.g., "John")
- `{{phone}}` - Phone number
- `{{group}}` - Contact's group

Example template:
```
Happy New Year {{firstName}}! 🎉

Wishing you an amazing 2026!
```

### 3. Avoid Getting Banned
- Don't send more than 50-100 messages per day
- Keep delays between 30-60 seconds (default)
- Only send to people who expect messages from you
- Don't use for commercial spam

### 4. Backup Your Data
```bash
# Export contacts
npm start contacts export contacts-backup.csv

# Export logs
npm start logs --export logs-backup.csv
```

## Troubleshooting

### QR Code Not Showing
- Make sure you're using Node.js 18 or higher
- Check your terminal supports Unicode characters
- Try running in a different terminal app

### "WhatsApp client is not ready"
- Wait a few seconds after scanning QR code
- Check your internet connection
- Try disconnecting and reconnecting

### Messages Not Sending
1. Check connection:
   ```bash
   npm start status
   ```

2. View failed messages:
   ```bash
   npm start logs --failed
   ```

3. Verify phone number format (must include country code)

### Session Expired
Delete session and re-authenticate:
```bash
rm -rf data/session
npm start init
```

## Next Steps

1. **Create Custom Templates**
   ```bash
   npm start templates create
   ```

2. **Organize Your Contacts**
   - Group contacts by relationship
   - Add custom fields for nicknames
   - Keep your contact list updated

3. **Schedule Regular Greetings**
   - Set reminders for birthdays
   - Plan ahead for festivals
   - Use the bot responsibly

4. **Explore Configuration**
   ```bash
   # View current config
   npm start config show

   # Adjust delays
   npm start config set delays.minDelay 45000
   ```

## Safety Checklist

Before sending messages:
- [ ] Tested with `--dry-run` first
- [ ] Verified all phone numbers are correct
- [ ] Recipients expect to hear from you
- [ ] Message is appropriate and personalized
- [ ] Not sending more than 100 messages today
- [ ] Reviewed and confirmed the preview

## Getting Help

- **Documentation**: See [README.md](README.md) for detailed docs
- **Project Plan**: Check [PROJECT_PLAN.md](PROJECT_PLAN.md) for features
- **Issues**: Report bugs on GitHub Issues
- **Security**: See [SECURITY.md](SECURITY.md) for security info

## Example Workflow: New Year Greetings

Here's a complete example workflow:

```bash
# 1. Add your contacts
npm start contacts import contacts.csv

# 2. Preview the New Year template
npm start templates show new-year-2026

# 3. Test with dry run
npm start send template -t "new-year-2026" -g "friends" --dry-run

# 4. If everything looks good, send for real
npm start send template -t "new-year-2026" -g "friends"

# 5. Check results
npm start logs
```

That's it! You're ready to send warm greetings to your friends and family. 🎉

Remember: Use this tool ethically and responsibly. Only send messages to people who know you and expect to hear from you.

---

**Happy Greeting!** 🎊
