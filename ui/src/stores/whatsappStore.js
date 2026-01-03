import { create } from 'zustand';

export const useWhatsAppStore = create((set, get) => ({
  isConnected: false,
  isInitializing: false,
  qrCode: null,
  error: null,

  checkStatus: async () => {
    try {
      const result = await window.electronAPI.whatsapp.getStatus();
      set({ isConnected: result.isReady });
      return result.isReady;
    } catch (error) {
      set({ error: error.message, isConnected: false });
      return false;
    }
  },

  initialize: async () => {
    set({ isInitializing: true, error: null, qrCode: null });

    try {
      // Set up event listeners
      window.electronAPI.whatsapp.onQR((qr) => {
        set({ qrCode: qr });
      });

      window.electronAPI.whatsapp.onReady(() => {
        set({ isConnected: true, isInitializing: false, qrCode: null });
      });

      window.electronAPI.whatsapp.onDisconnected((reason) => {
        set({ isConnected: false, error: reason });
      });

      // Start initialization
      const result = await window.electronAPI.whatsapp.initialize();

      if (!result.success) {
        throw new Error(result.error);
      }

      return true;
    } catch (error) {
      set({ error: error.message, isInitializing: false });
      return false;
    }
  },

  disconnect: async () => {
    try {
      await window.electronAPI.whatsapp.disconnect();
      set({ isConnected: false, qrCode: null });
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  clearError: () => set({ error: null })
}));
