import fs from 'fs';
import path from 'path';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import templateParser from './parser.js';
import { v4 as uuidv4 } from 'uuid';

class TemplateManager {
  constructor() {
    this.templatesFile = path.resolve(config.get('data.templatesFile'));
    this.templates = this.loadTemplates();
  }

  loadTemplates() {
    try {
      if (fs.existsSync(this.templatesFile)) {
        const data = fs.readFileSync(this.templatesFile, 'utf8');
        return JSON.parse(data);
      }
      // Initialize with default templates
      return this.getDefaultTemplates();
    } catch (error) {
      logger.error('Failed to load templates', { error: error.message });
      return this.getDefaultTemplates();
    }
  }

  getDefaultTemplates() {
    return {
      templates: [
        {
          id: 'new-year-2026',
          name: 'New Year 2026',
          occasion: 'new-year',
          content: 'Happy New Year {{name}}! 🎉\n\nWishing you a fantastic 2026 filled with joy, success, and amazing memories! May all your dreams come true.\n\nCheers to new beginnings! 🥳',
          variables: ['name'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'birthday-wishes',
          name: 'Birthday Wishes',
          occasion: 'birthday',
          content: 'Happy Birthday {{name}}! 🎂🎈\n\nWishing you a day filled with happiness, laughter, and wonderful surprises. May this year bring you everything you hope for!\n\nHave a fantastic celebration! 🎉',
          variables: ['name'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'diwali-greetings',
          name: 'Diwali Greetings',
          occasion: 'diwali',
          content: 'Happy Diwali {{name}}! 🪔✨\n\nMay this festival of lights bring joy, prosperity, and good health to you and your family. Wishing you a sparkling Diwali!\n\nShubh Deepavali! 🎆',
          variables: ['name'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'christmas-wishes',
          name: 'Christmas Wishes',
          occasion: 'christmas',
          content: 'Merry Christmas {{name}}! 🎄🎅\n\nWishing you and your loved ones a joyous holiday season filled with love, peace, and happiness. May Santa bring you everything you wish for!\n\nHappy Holidays! ⛄',
          variables: ['name'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'generic-greeting',
          name: 'Generic Greeting',
          occasion: 'general',
          content: 'Hello {{name}}! 👋\n\nHope you\'re doing well! Just wanted to reach out and say hi.\n\nTake care! 😊',
          variables: ['name'],
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  saveTemplates() {
    try {
      const dir = path.dirname(this.templatesFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.templatesFile,
        JSON.stringify(this.templates, null, 2),
        'utf8'
      );
      logger.info('Templates saved successfully');
      return true;
    } catch (error) {
      logger.error('Failed to save templates', { error: error.message });
      return false;
    }
  }

  createTemplate(templateData) {
    const template = {
      id: templateData.id || uuidv4(),
      name: templateData.name,
      occasion: templateData.occasion || 'general',
      content: templateData.content,
      variables: templateParser.extractVariables(templateData.content),
      createdAt: new Date().toISOString()
    };

    // Check for duplicate ID
    const existing = this.templates.templates.find(t => t.id === template.id);
    if (existing) {
      throw new Error(`Template with id ${template.id} already exists`);
    }

    this.templates.templates.push(template);
    this.saveTemplates();
    logger.info('Template created', { name: template.name, id: template.id });
    return template;
  }

  updateTemplate(id, updates) {
    const index = this.templates.templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }

    // If content is updated, re-extract variables
    if (updates.content) {
      updates.variables = templateParser.extractVariables(updates.content);
    }

    this.templates.templates[index] = {
      ...this.templates.templates[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    this.saveTemplates();
    logger.info('Template updated', { id });
    return this.templates.templates[index];
  }

  deleteTemplate(id) {
    const index = this.templates.templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template with id ${id} not found`);
    }

    const deleted = this.templates.templates.splice(index, 1)[0];
    this.saveTemplates();
    logger.info('Template deleted', { id, name: deleted.name });
    return deleted;
  }

  getTemplate(id) {
    return this.templates.templates.find(t => t.id === id);
  }

  getTemplateByName(name) {
    return this.templates.templates.find(t =>
      t.name.toLowerCase() === name.toLowerCase()
    );
  }

  getAllTemplates() {
    return this.templates.templates;
  }

  getTemplatesByOccasion(occasion) {
    return this.templates.templates.filter(t => t.occasion === occasion);
  }

  searchTemplates(query) {
    const lowerQuery = query.toLowerCase();
    return this.templates.templates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.occasion.toLowerCase().includes(lowerQuery) ||
      t.content.toLowerCase().includes(lowerQuery)
    );
  }

  renderTemplate(templateId, contact) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    return templateParser.parseForContact(template.content, contact);
  }

  renderTemplateForAll(templateId, contacts) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    return contacts.map(contact => ({
      contact,
      message: templateParser.parseForContact(template.content, contact)
    }));
  }

  previewTemplate(templateId, sampleData = {}) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    return templateParser.preview(template.content, sampleData);
  }

  validateTemplate(templateId, contact) {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    const contactData = templateParser.getContactData(contact);
    return templateParser.validate(template.content, contactData);
  }

  getOccasions() {
    const occasions = new Set(this.templates.templates.map(t => t.occasion));
    return Array.from(occasions);
  }

  resetToDefaults() {
    this.templates = this.getDefaultTemplates();
    this.saveTemplates();
    logger.info('Templates reset to defaults');
    return this.templates.templates;
  }
}

export default new TemplateManager();
