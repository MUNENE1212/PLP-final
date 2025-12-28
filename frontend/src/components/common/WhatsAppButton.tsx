import { useState } from 'react';
import { MessageCircle, X, Send, Phone, Calendar, Wrench } from 'lucide-react';
import { Button } from '@/components/ui';

// WhatsApp business number
const WHATSAPP_NUMBER = '254799954672'; // Format: country code + number (no + or spaces)

interface QuickAction {
  icon: typeof Phone;
  label: string;
  message: string;
}

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const quickActions: QuickAction[] = [
    {
      icon: Wrench,
      label: 'Book a Technician',
      message: 'Hello! I need help booking a technician for an emergency repair. Can you assist me?',
    },
    {
      icon: Calendar,
      label: 'Schedule Service',
      message: 'Hi! I would like to schedule a maintenance service. When can someone help me?',
    },
    {
      icon: Phone,
      label: 'Emergency Support',
      message: 'URGENT! I need immediate technical assistance. Please help!',
    },
  ];

  const sendWhatsAppMessage = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMessage('');
  };

  const handleQuickAction = (action: QuickAction) => {
    sendWhatsAppMessage(action.message);
  };

  const handleCustomMessage = () => {
    if (customMessage.trim()) {
      sendWhatsAppMessage(customMessage);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center space-x-2 group"
            aria-label="Open WhatsApp Chat"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="hidden group-hover:inline-block pr-2 font-medium">
              Chat with us
            </span>
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-green-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-full p-2">
                  <MessageCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold">WhatsApp Support</h3>
                  <p className="text-xs text-green-100">We typically reply instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-600 rounded-full p-1 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Welcome Message */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  👋 Hello! How can we help you today?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose a quick action or send us a custom message.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mb-4">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Quick Actions:
                </p>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors text-left"
                    >
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {action.label}
                        </p>
                      </div>
                      <Send className="h-4 w-4 text-gray-400" />
                    </button>
                  );
                })}
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Or send a custom message:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <Button
                    onClick={handleCustomMessage}
                    disabled={!customMessage.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white px-4"
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Powered by WhatsApp Business
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default WhatsAppButton;
