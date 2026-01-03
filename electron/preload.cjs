const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // WhatsApp
  whatsapp: {
    initialize: () => ipcRenderer.invoke('whatsapp:initialize'),
    disconnect: () => ipcRenderer.invoke('whatsapp:disconnect'),
    getStatus: () => ipcRenderer.invoke('whatsapp:getStatus'),
    isReady: () => ipcRenderer.invoke('whatsapp:isReady'),
    onQR: (callback) => {
      ipcRenderer.on('whatsapp:qr', (event, qr) => callback(qr));
      return () => ipcRenderer.removeAllListeners('whatsapp:qr');
    },
    onReady: (callback) => {
      ipcRenderer.on('whatsapp:ready', () => callback());
      return () => ipcRenderer.removeAllListeners('whatsapp:ready');
    },
    onDisconnected: (callback) => {
      ipcRenderer.on('whatsapp:disconnected', (event, reason) => callback(reason));
      return () => ipcRenderer.removeAllListeners('whatsapp:disconnected');
    }
  },

  // Contacts
  contacts: {
    getAll: () => ipcRenderer.invoke('contacts:getAll'),
    getActive: () => ipcRenderer.invoke('contacts:getActive'),
    getByGroup: (group) => ipcRenderer.invoke('contacts:getByGroup', group),
    getGroups: () => ipcRenderer.invoke('contacts:getGroups'),
    getStats: () => ipcRenderer.invoke('contacts:getStats'),
    add: (contact) => ipcRenderer.invoke('contacts:add', contact),
    update: (id, updates) => ipcRenderer.invoke('contacts:update', id, updates),
    delete: (id) => ipcRenderer.invoke('contacts:delete', id),
    blacklist: (id, value) => ipcRenderer.invoke('contacts:blacklist', id, value),
    search: (query) => ipcRenderer.invoke('contacts:search', query),
    importCSV: (csvData) => ipcRenderer.invoke('contacts:importCSV', csvData),
    exportCSV: () => ipcRenderer.invoke('contacts:exportCSV'),
    addGroup: (name) => ipcRenderer.invoke('contacts:addGroup', name)
  },

  // Templates
  templates: {
    getAll: () => ipcRenderer.invoke('templates:getAll'),
    get: (id) => ipcRenderer.invoke('templates:get', id),
    getByOccasion: (occasion) => ipcRenderer.invoke('templates:getByOccasion', occasion),
    getOccasions: () => ipcRenderer.invoke('templates:getOccasions'),
    create: (template) => ipcRenderer.invoke('templates:create', template),
    update: (id, updates) => ipcRenderer.invoke('templates:update', id, updates),
    delete: (id) => ipcRenderer.invoke('templates:delete', id),
    preview: (id, data) => ipcRenderer.invoke('templates:preview', id, data),
    search: (query) => ipcRenderer.invoke('templates:search', query),
    resetDefaults: () => ipcRenderer.invoke('templates:resetDefaults')
  },

  // Send
  send: {
    toContact: (contactId, message, options) =>
      ipcRenderer.invoke('send:toContact', contactId, message, options),
    toGroup: (groupName, templateId, options) =>
      ipcRenderer.invoke('send:toGroup', groupName, templateId, options),
    toAll: (templateId, options) =>
      ipcRenderer.invoke('send:toAll', templateId, options),
    withTemplate: (contactIds, templateId, options) =>
      ipcRenderer.invoke('send:withTemplate', contactIds, templateId, options),
    custom: (contactIds, message, options) =>
      ipcRenderer.invoke('send:custom', contactIds, message, options),
    getRateLimitInfo: () => ipcRenderer.invoke('send:getRateLimitInfo'),
    onProgress: (callback) => {
      ipcRenderer.on('send:progress', (event, progress) => callback(progress));
      return () => ipcRenderer.removeAllListeners('send:progress');
    }
  },

  // Config
  config: {
    getAll: () => ipcRenderer.invoke('config:getAll'),
    get: (key) => ipcRenderer.invoke('config:get', key),
    set: (key, value) => ipcRenderer.invoke('config:set', key, value),
    reset: () => ipcRenderer.invoke('config:reset')
  },

  // Logs
  logs: {
    getActivity: (date) => ipcRenderer.invoke('logs:getActivity', date),
    getFailed: (date) => ipcRenderer.invoke('logs:getFailed', date),
    export: (outputPath) => ipcRenderer.invoke('logs:export', outputPath)
  },

  // App
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
    quit: () => ipcRenderer.send('app:quit')
  },

  // File operations
  files: {
    readFile: (filePath) => ipcRenderer.invoke('files:read', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('files:write', filePath, content),
    selectFile: (options) => ipcRenderer.invoke('files:select', options),
    selectSaveFile: (options) => ipcRenderer.invoke('files:selectSave', options)
  }
});
