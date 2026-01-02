import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../utils/config.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContactManager {
  constructor() {
    this.contactsFile = path.resolve(config.get('data.contactsFile'));
    this.contacts = this.loadContacts();
  }

  loadContacts() {
    try {
      if (fs.existsSync(this.contactsFile)) {
        const data = fs.readFileSync(this.contactsFile, 'utf8');
        return JSON.parse(data);
      }
      // Initialize with default structure
      return {
        contacts: [],
        groups: ['family', 'friends', 'colleagues', 'relatives']
      };
    } catch (error) {
      logger.error('Failed to load contacts', { error: error.message });
      return { contacts: [], groups: [] };
    }
  }

  saveContacts() {
    try {
      const dir = path.dirname(this.contactsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.contactsFile,
        JSON.stringify(this.contacts, null, 2),
        'utf8'
      );
      logger.info('Contacts saved successfully');
      return true;
    } catch (error) {
      logger.error('Failed to save contacts', { error: error.message });
      return false;
    }
  }

  addContact(contactData) {
    const contact = {
      id: uuidv4(),
      name: contactData.name,
      phone: contactData.phone,
      group: contactData.group || 'friends',
      customFields: contactData.customFields || {},
      blacklisted: false,
      lastSent: null,
      createdAt: new Date().toISOString()
    };

    // Check for duplicate phone numbers
    const existing = this.contacts.contacts.find(c => c.phone === contact.phone);
    if (existing) {
      throw new Error(`Contact with phone number ${contact.phone} already exists`);
    }

    this.contacts.contacts.push(contact);
    this.saveContacts();
    logger.info('Contact added', { name: contact.name, phone: contact.phone });
    return contact;
  }

  updateContact(id, updates) {
    const index = this.contacts.contacts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Contact with id ${id} not found`);
    }

    this.contacts.contacts[index] = {
      ...this.contacts.contacts[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    this.saveContacts();
    logger.info('Contact updated', { id });
    return this.contacts.contacts[index];
  }

  deleteContact(id) {
    const index = this.contacts.contacts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Contact with id ${id} not found`);
    }

    const deleted = this.contacts.contacts.splice(index, 1)[0];
    this.saveContacts();
    logger.info('Contact deleted', { id, name: deleted.name });
    return deleted;
  }

  getContact(id) {
    return this.contacts.contacts.find(c => c.id === id);
  }

  getContactByPhone(phone) {
    return this.contacts.contacts.find(c => c.phone === phone);
  }

  getAllContacts() {
    return this.contacts.contacts;
  }

  getContactsByGroup(group) {
    return this.contacts.contacts.filter(c => c.group === group);
  }

  getActiveContacts() {
    return this.contacts.contacts.filter(c => !c.blacklisted);
  }

  blacklistContact(id, blacklisted = true) {
    return this.updateContact(id, { blacklisted });
  }

  addGroup(groupName) {
    if (!this.contacts.groups.includes(groupName)) {
      this.contacts.groups.push(groupName);
      this.saveContacts();
      logger.info('Group added', { group: groupName });
      return true;
    }
    return false;
  }

  getGroups() {
    return this.contacts.groups;
  }

  updateLastSent(id) {
    return this.updateContact(id, { lastSent: new Date().toISOString() });
  }

  searchContacts(query) {
    const lowerQuery = query.toLowerCase();
    return this.contacts.contacts.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query) ||
      c.group.toLowerCase().includes(lowerQuery)
    );
  }

  importFromCSV(csvData) {
    // Expected CSV format: name,phone,group,customField1,customField2,...
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const nameIndex = headers.indexOf('name');
    const phoneIndex = headers.indexOf('phone');
    const groupIndex = headers.indexOf('group');

    if (nameIndex === -1 || phoneIndex === -1) {
      throw new Error('CSV must have "name" and "phone" columns');
    }

    const imported = [];
    const failed = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());

        const contactData = {
          name: values[nameIndex],
          phone: values[phoneIndex],
          group: groupIndex !== -1 ? values[groupIndex] : 'friends',
          customFields: {}
        };

        // Add custom fields
        headers.forEach((header, index) => {
          if (index !== nameIndex && index !== phoneIndex && index !== groupIndex && values[index]) {
            contactData.customFields[header] = values[index];
          }
        });

        const contact = this.addContact(contactData);
        imported.push(contact);
      } catch (error) {
        failed.push({ line: i + 1, error: error.message });
      }
    }

    logger.info('CSV import completed', {
      imported: imported.length,
      failed: failed.length
    });

    return { imported, failed };
  }

  exportToCSV() {
    if (this.contacts.contacts.length === 0) {
      return '';
    }

    // Get all possible custom field names
    const customFieldNames = new Set();
    this.contacts.contacts.forEach(c => {
      Object.keys(c.customFields || {}).forEach(key => customFieldNames.add(key));
    });

    // Build header
    const headers = ['name', 'phone', 'group', ...Array.from(customFieldNames)];
    let csv = headers.join(',') + '\n';

    // Build rows
    this.contacts.contacts.forEach(contact => {
      const row = [
        contact.name,
        contact.phone,
        contact.group,
        ...Array.from(customFieldNames).map(field => contact.customFields?.[field] || '')
      ];
      csv += row.map(v => `"${v}"`).join(',') + '\n';
    });

    return csv;
  }

  getStats() {
    const total = this.contacts.contacts.length;
    const active = this.getActiveContacts().length;
    const blacklisted = total - active;
    const byGroup = {};

    this.contacts.groups.forEach(group => {
      byGroup[group] = this.getContactsByGroup(group).length;
    });

    return {
      total,
      active,
      blacklisted,
      byGroup,
      groups: this.contacts.groups
    };
  }
}

export default new ContactManager();
