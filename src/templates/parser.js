import logger from '../utils/logger.js';

class TemplateParser {
  constructor() {
    this.variablePattern = /\{\{(\w+)\}\}/g;
  }

  parse(template, data) {
    if (!template || typeof template !== 'string') {
      throw new Error('Template must be a non-empty string');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Data must be an object');
    }

    let result = template;

    // Replace all {{variable}} with corresponding data
    result = result.replace(this.variablePattern, (match, variable) => {
      if (data.hasOwnProperty(variable)) {
        return data[variable];
      }

      logger.warn('Template variable not found in data', { variable });
      return match; // Keep the placeholder if variable not found
    });

    return result;
  }

  extractVariables(template) {
    const variables = new Set();
    let match;

    // Reset regex state
    this.variablePattern.lastIndex = 0;

    while ((match = this.variablePattern.exec(template)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  validate(template, data) {
    const requiredVariables = this.extractVariables(template);
    const missingVariables = requiredVariables.filter(v => !data.hasOwnProperty(v));

    return {
      valid: missingVariables.length === 0,
      requiredVariables,
      missingVariables
    };
  }

  preview(template, sampleData = {}) {
    const defaultSample = {
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      ...sampleData
    };

    return this.parse(template, defaultSample);
  }

  getContactData(contact) {
    const nameParts = contact.name.split(' ');

    return {
      name: contact.name,
      firstName: nameParts[0] || contact.name,
      lastName: nameParts.slice(1).join(' ') || '',
      phone: contact.phone,
      group: contact.group,
      ...contact.customFields
    };
  }

  parseForContact(template, contact) {
    const data = this.getContactData(contact);
    return this.parse(template, data);
  }
}

export default new TemplateParser();
