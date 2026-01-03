# WhatsApp Greetings Bot - Electron Desktop App

## Overview

This is the desktop application version of the WhatsApp Greetings Bot, built with Electron + React. It provides a modern, user-friendly interface while keeping all your data local and secure.

## Architecture

```
├── electron/              # Electron main process
│   ├── main.js           # Main entry point
│   ├── preload.js        # IPC bridge (secure)
│   └── ipc/              # IPC handlers (bridge to backend)
│       ├── whatsapp-handlers.js
│       ├── contacts-handlers.js
│       ├── templates-handlers.js
│       ├── send-handlers.js
│       ├── config-handlers.js
│       └── logs-handlers.js
├── src/                  # Existing Node.js backend (unchanged)
├── ui/                   # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand state management
│   │   └── styles/       # Tailwind CSS
│   └── index.html
```

## Tech Stack

- **Desktop Framework**: Electron 39
- **Frontend**: React 19 + Vite
- **UI**: Tailwind CSS + Lucide Icons
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Backend**: Existing Node.js modules (ES6)

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Install Dependencies

Dependencies are already installed, but if you need to reinstall:

```bash
npm install
```

### Run in Development Mode

Start the app in development mode with hot reload:

```bash
npm run dev
```

This will:
1. Start Vite dev server on http://localhost:5173
2. Wait for Vite to be ready
3. Launch Electron with the React UI

### Development Scripts

```bash
# Start full app (recommended)
npm run dev

# Start only the React UI (for UI development)
npm run dev:ui

# Start only Electron (UI must be running separately)
npm run dev:electron

# Run CLI version (original)
npm run cli
```

## Building for Production

### Build UI Only

```bash
npm run build:ui
```

This compiles the React app to `ui/dist/`

### Build Electron App

```bash
npm run build
```

This will:
1. Build the React UI
2. Package the Electron app for your platform

Output will be in `dist-electron/`

### Platform-Specific Builds

The build configuration in `package.json` supports:

- **macOS**: DMG and ZIP
- **Windows**: NSIS installer and portable exe
- **Linux**: AppImage and DEB package

## Project Structure

### Electron Main Process (`electron/`)

**main.js**: Creates the browser window and manages app lifecycle

**preload.js**: Secure IPC bridge between renderer and main process. Exposes:
- `window.electronAPI.whatsapp.*` - WhatsApp operations
- `window.electronAPI.contacts.*` - Contact management
- `window.electronAPI.templates.*` - Template management
- `window.electronAPI.send.*` - Message sending
- `window.electronAPI.config.*` - Configuration
- `window.electronAPI.logs.*` - Activity logs
- `window.electronAPI.files.*` - File operations

**ipc/handlers**: Bridge to existing backend modules via IPC

### React Frontend (`ui/src/`)

**Pages**:
- `WhatsAppSetup.jsx` - QR code scanning and connection
- `Dashboard.jsx` - Overview stats and recent activity
- `Contacts.jsx` - Contact list management
- `Templates.jsx` - Template editor (placeholder)
- `Send.jsx` - Send messages interface (placeholder)
- `Logs.jsx` - Activity logs viewer (placeholder)
- `Settings.jsx` - App settings (placeholder)

**Components**:
- `Layout.jsx` - Main app layout with sidebar navigation

**Stores**:
- `whatsappStore.js` - WhatsApp connection state

## Features Implemented

### ✅ Complete

1. **Electron Setup**
   - Main process configuration
   - Secure IPC communication
   - Preload script with contextBridge

2. **IPC Handlers**
   - All backend modules bridged to frontend
   - WhatsApp, Contacts, Templates, Send, Config, Logs

3. **React UI Foundation**
   - Vite build system
   - Tailwind CSS styling
   - React Router routing
   - TanStack Query for data fetching
   - Zustand for state management

4. **WhatsApp Connection**
   - Beautiful QR code scanning UI
   - Real-time connection status
   - Event handling (QR, ready, disconnected)

5. **Dashboard**
   - Contact statistics
   - Template count
   - Daily message usage
   - Recent activity feed
   - Contact group breakdown

6. **Contacts Page**
   - Full contact list with search
   - Import/Export CSV
   - Edit, Delete, Block actions
   - Group filtering
   - Status indicators

### 🚧 To Complete (Placeholders Created)

7. **Templates Page** - Full CRUD interface needed
8. **Send Page** - Message composition and sending UI needed
9. **Logs Page** - Advanced filtering and export needed
10. **Settings Page** - Configuration UI needed

## API Reference (IPC)

### WhatsApp API

```javascript
// Initialize and connect
await window.electronAPI.whatsapp.initialize();

// Disconnect
await window.electronAPI.whatsapp.disconnect();

// Check status
const status = await window.electronAPI.whatsapp.getStatus();

// Event listeners
window.electronAPI.whatsapp.onQR((qr) => console.log(qr));
window.electronAPI.whatsapp.onReady(() => console.log('Ready!'));
window.electronAPI.whatsapp.onDisconnected((reason) => console.log(reason));
```

### Contacts API

```javascript
// Get all contacts
const { data } = await window.electronAPI.contacts.getAll();

// Get active only
const { data } = await window.electronAPI.contacts.getActive();

// Get by group
const { data } = await window.electronAPI.contacts.getByGroup('friends');

// Add contact
await window.electronAPI.contacts.add({
  name: 'John Doe',
  phone: '+919876543210',
  group: 'friends'
});

// Update contact
await window.electronAPI.contacts.update(id, { name: 'Jane Doe' });

// Delete contact
await window.electronAPI.contacts.delete(id);

// Import/Export CSV
const result = await window.electronAPI.contacts.importCSV(csvData);
const { data: csv } = await window.electronAPI.contacts.exportCSV();
```

### Templates API

```javascript
// Get all templates
const { data } = await window.electronAPI.templates.getAll();

// Get single template
const { data } = await window.electronAPI.templates.get(id);

// Create template
await window.electronAPI.templates.create({
  name: 'New Year',
  occasion: 'new-year',
  content: 'Happy New Year {{name}}!'
});

// Update template
await window.electronAPI.templates.update(id, { content: 'Updated content' });

// Preview template
const { data } = await window.electronAPI.templates.preview(id, { name: 'John' });
```

### Send API

```javascript
// Send to group with template
const result = await window.electronAPI.send.toGroup('friends', templateId, {
  dryRun: false
});

// Send to all contacts
const result = await window.electronAPI.send.toAll(templateId, { dryRun: true });

// Send custom message
const result = await window.electronAPI.send.custom(
  [contactId1, contactId2],
  'Hello {{name}}!',
  { dryRun: false }
);

// Progress events
window.electronAPI.send.onProgress((progress) => {
  console.log(`${progress.sent}/${progress.total} sent`);
});

// Get rate limit info
const { data } = await window.electronAPI.send.getRateLimitInfo();
```

### Config API

```javascript
// Get all config
const { data } = await window.electronAPI.config.getAll();

// Get specific value
const { data } = await window.electronAPI.config.get('delays.minDelay');

// Set value
await window.electronAPI.config.set('delays.minDelay', 45000);

// Reset to defaults
await window.electronAPI.config.reset();
```

### Logs API

```javascript
// Get activity logs
const { data } = await window.electronAPI.logs.getActivity();

// Get failed messages only
const { data } = await window.electronAPI.logs.getFailed();

// Export to CSV
await window.electronAPI.logs.export('/path/to/export.csv');
```

## Styling Guide

The app uses Tailwind CSS with custom utility classes:

### Button Styles
```jsx
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-secondary">Secondary Action</button>
<button className="btn btn-danger">Delete</button>
```

### Card Style
```jsx
<div className="card">
  <h2>Card Title</h2>
  <p>Card content...</p>
</div>
```

### Input Style
```jsx
<label className="label">Field Label</label>
<input type="text" className="input" />
```

### Colors
- Primary: Green (`primary-600`, `primary-700`, etc.)
- Success: Green
- Warning: Yellow
- Danger: Red
- Neutral: Gray

## Security

### IPC Security

- **Context Isolation**: Enabled
- **Node Integration**: Disabled
- **Preload Script**: Uses contextBridge for secure API exposure
- **No Direct Node Access**: Renderer process cannot access Node.js APIs directly

### Data Security

- All data stored locally in `data/` directory
- WhatsApp session stored in `data/session/`
- No data sent to external servers
- Session data never exposed to renderer process

## Troubleshooting

### App Won't Start

1. Make sure dependencies are installed: `npm install`
2. Check if port 5173 is available
3. Try clearing node_modules and reinstalling

### WhatsApp Won't Connect

1. Check if WhatsApp Web is working in browser
2. Delete `data/session/` and try again
3. Check firewall/antivirus settings

### Build Fails

1. Run `npm run build:ui` first separately
2. Check for TypeScript/ESLint errors
3. Ensure all dependencies are installed

## Next Steps

To complete the app, implement these pages:

1. **Templates Page**: Full CRUD with preview
2. **Send Page**: Select contacts/groups, choose template, preview, send
3. **Logs Page**: Filter by date, export, view details
4. **Settings Page**: Edit config values, reset, backup/restore

Refer to the CLI implementation in `src/cli/commands/` for logic reference.

## Contributing

When adding new features:

1. Add IPC handler in `electron/ipc/`
2. Expose API in `electron/preload.js`
3. Create/update React components in `ui/src/`
4. Use TanStack Query for data fetching
5. Follow existing patterns and styling

## Resources

- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Ready to run?** Execute `npm run dev` and start building!
