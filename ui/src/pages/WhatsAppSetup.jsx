import { useState, useEffect } from 'react';
import { MessageCircle, Smartphone, Loader2 } from 'lucide-react';
import { useWhatsAppStore } from '../stores/whatsappStore';
import QRCode from 'qrcode';

export default function WhatsAppSetup() {
  const { initialize, isInitializing, qrCode, error, isConnected } = useWhatsAppStore();
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    if (qrCode) {
      QRCode.toDataURL(qrCode, { width: 300, margin: 2 }).then(setQrDataUrl);
    }
  }, [qrCode]);

  const handleConnect = async () => {
    await initialize();
  };

  if (isConnected) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WhatsApp Greetings Bot
          </h1>
          <p className="text-gray-600">
            Connect your WhatsApp to start sending personalized greetings
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {!isInitializing && !qrCode && (
            <div className="text-center">
              <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Connect
              </h2>
              <p className="text-gray-600 mb-6">
                Click the button below to generate a QR code and connect your WhatsApp account
              </p>
              <button
                onClick={handleConnect}
                className="btn btn-primary text-lg px-8 py-3"
              >
                Connect WhatsApp
              </button>
            </div>
          )}

          {isInitializing && !qrCode && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Initializing WhatsApp client...</p>
            </div>
          )}

          {qrCode && qrDataUrl && (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scan QR Code
              </h2>
              <div className="bg-white border-4 border-gray-200 rounded-xl inline-block p-4 mb-6">
                <img src={qrDataUrl} alt="QR Code" className="w-72 h-72" />
              </div>
              <div className="text-left bg-gray-50 rounded-lg p-6">
                <p className="font-medium text-gray-900 mb-3">How to connect:</p>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="font-semibold text-primary-600 mr-2">1.</span>
                    <span>Open WhatsApp on your phone</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-primary-600 mr-2">2.</span>
                    <span>Go to <strong>Settings</strong> → <strong>Linked Devices</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-primary-600 mr-2">3.</span>
                    <span>Tap <strong>Link a Device</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold text-primary-600 mr-2">4.</span>
                    <span>Scan the QR code above</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Your WhatsApp session is stored locally on your device. We never access your messages or data.
        </p>
      </div>
    </div>
  );
}
