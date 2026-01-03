// Minimal Electron test
try {
  console.log('[1] Starting require...');
  const electron = require('electron');
  console.log('[2] Required electron, type:', typeof electron);

  if (typeof electron === 'string') {
    console.log('[ERROR] Got string instead of object:', electron);
    process.exit(1);
  }

  const { app, BrowserWindow } = electron;
  console.log('[3] Destructured app:', typeof app);

  app.whenReady().then(() => {
    console.log('[4] App ready!');
    const win = new BrowserWindow({ width: 400, height: 300 });
    win.loadURL('data:text/html,<h1>Electron Works!</h1>');

    setTimeout(() => {
      console.log('[5] Quitting...');
      app.quit();
    }, 2000);
  });

  app.on('window-all-closed', () => {
    console.log('[6] All windows closed');
    app.quit();
  });

} catch (err) {
  console.error('[ERROR]', err);
  process.exit(1);
}
