import winston from 'winston';
import path from 'path';
import fs from 'fs';
import config from './config.js';

const logsDir = path.dirname(config.get('logging.file'));

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
  level: config.get('logging.level') || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'greetings-bot' },
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: config.get('logging.file'),
      maxsize: 10485760, // 10MB
      maxFiles: config.get('logging.maxFiles') || 5,
    }),
    // Write errors to separate file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5,
    }),
  ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export default logger;

export class ActivityLogger {
  constructor() {
    this.activityLogPath = path.join(logsDir, 'activity.log');
  }

  log(action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      ...details
    };

    const logLine = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.activityLogPath, logLine, 'utf8');
  }

  logMessageSent(contact, template, status, error = null) {
    this.log('message_sent', {
      contact: contact.name,
      phone: contact.phone,
      template,
      status,
      error: error?.message || null
    });
  }

  getActivityLogs(date = null) {
    if (!fs.existsSync(this.activityLogPath)) {
      return [];
    }

    const logs = fs.readFileSync(this.activityLogPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    if (date) {
      const targetDate = new Date(date).toISOString().split('T')[0];
      return logs.filter(log => log.timestamp.startsWith(targetDate));
    }

    return logs;
  }

  getFailedMessages(date = null) {
    const logs = this.getActivityLogs(date);
    return logs.filter(log => log.action === 'message_sent' && log.status === 'failed');
  }

  exportToCsv(outputPath) {
    const logs = this.getActivityLogs();
    if (logs.length === 0) {
      return false;
    }

    const headers = Object.keys(logs[0]).join(',') + '\n';
    const rows = logs.map(log =>
      Object.values(log).map(v => `"${v}"`).join(',')
    ).join('\n');

    fs.writeFileSync(outputPath, headers + rows, 'utf8');
    return true;
  }
}

export const activityLogger = new ActivityLogger();
