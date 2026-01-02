# Security Policy

## Responsible Use

This tool is designed for personal, ethical use to send greetings to friends and family. Please use it responsibly.

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by:

1. **DO NOT** open a public issue
2. Email the maintainers directly (add security contact email when available)
3. Include detailed steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

We will:
- Acknowledge your email within 48 hours
- Provide an estimated timeline for a fix
- Notify you when the vulnerability is fixed
- Credit you in the security advisory (if desired)

## Security Best Practices for Users

### Protecting Your Data

1. **Session Data**: The `data/session/` directory contains your WhatsApp authentication. Keep it secure:
   ```bash
   chmod 700 data/session
   ```

2. **Contact Data**: Your `data/contacts.json` contains personal information:
   - Never commit this file to git (it's in .gitignore)
   - Make backups securely
   - Don't share with untrusted parties

3. **Logs**: Activity logs may contain phone numbers:
   - Review logs before sharing
   - Regularly clean old logs
   - Be careful when exporting logs

### Account Security

1. **WhatsApp Session**:
   - The bot uses WhatsApp Web authentication
   - You can see and revoke sessions in WhatsApp > Settings > Linked Devices
   - If compromised, disconnect the session immediately

2. **Rate Limits**:
   - Don't disable rate limiting
   - Don't significantly reduce delays
   - These protect your account from bans

3. **Two-Factor Authentication**:
   - Enable 2FA on your WhatsApp account
   - This adds an extra layer of security

### System Security

1. **Keep Dependencies Updated**:
   ```bash
   npm audit
   npm update
   ```

2. **Environment**:
   - Run on a secure, trusted system
   - Don't run on shared/public computers
   - Use file system encryption if available

3. **Network**:
   - Use secure networks
   - Avoid public WiFi when possible
   - Consider using a VPN

## Known Security Considerations

### Data Storage

- **Local Only**: All data is stored locally, not sent to external servers
- **Plain Text**: Contacts and logs are stored in plain text JSON files
- **Session Data**: WhatsApp session is stored by puppeteer in `data/session/`

### Authentication

- **No Password**: The bot doesn't implement its own authentication
- **WhatsApp Auth**: Uses WhatsApp's own authentication via QR code
- **Session Persistence**: Session data is persisted locally

### Network Communication

- **WhatsApp Only**: Only communicates with WhatsApp Web servers
- **No Analytics**: No data sent to third parties
- **HTTPS**: All WhatsApp communication is over HTTPS

## Potential Risks

### Account Restrictions

WhatsApp may restrict or ban accounts that:
- Send too many messages too quickly
- Send spam or unwanted messages
- Violate WhatsApp Terms of Service

**Mitigation**: Use built-in rate limiting and delays

### Data Privacy

Your contacts' information is stored locally:
- **Risk**: If your device is compromised, contact data may be exposed
- **Mitigation**: Use system encryption, secure backups

### Malicious Use

This tool could be misused for spam or harassment:
- **Risk**: Account ban, legal consequences
- **Mitigation**: Use only for legitimate, consensual communication

## Compliance

### WhatsApp Terms of Service

Users must comply with [WhatsApp Terms of Service](https://www.whatsapp.com/legal/terms-of-service).

Key points:
- Don't use for spam or bulk messaging for commercial purposes
- Don't use automated systems for unauthorized purposes
- Respect recipient privacy and consent

### Data Protection

If operating in regions with data protection laws (GDPR, CCPA, etc.):
- Obtain consent before storing contact information
- Provide ability to delete data upon request
- Don't share contact data with third parties

## Security Features

### Built-in Protections

1. **Input Validation**: Phone numbers and user input are validated
2. **Rate Limiting**: Configurable daily message limits
3. **Logging**: Activity logging for audit trails
4. **Error Handling**: Graceful error handling to prevent crashes

### What We Don't Do

1. **No Remote Access**: The bot doesn't accept remote connections
2. **No External APIs**: Doesn't send data to external services
3. **No Telemetry**: Doesn't collect usage statistics
4. **No Auto-Updates**: Updates are manual and transparent

## Recommended Configuration

For maximum security:

```json
{
  "limits": {
    "enabled": true,
    "dailyLimit": 50
  },
  "delays": {
    "minDelay": 45000,
    "maxDelay": 90000,
    "randomize": true
  },
  "logging": {
    "level": "info"
  }
}
```

## Incident Response

If you suspect a security issue:

1. **Disconnect**: Revoke the WhatsApp Web session
2. **Review Logs**: Check `data/logs/` for suspicious activity
3. **Change Passwords**: If you suspect account compromise
4. **Report**: Contact the maintainers
5. **Document**: Keep records of the incident

## Legal Notice

This software is provided "as is" without warranty. Users are responsible for:
- Complying with all applicable laws
- Protecting their own data and accounts
- Consequences of misuse
- Any account restrictions or bans

## Updates

This security policy may be updated. Check back regularly for changes.

---

Last updated: 2026-01-03
