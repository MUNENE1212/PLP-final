import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2, Maximize2, Bot, User, Calendar, Search, MessageCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  options?: string[];
  action?: 'booking' | 'navigate' | 'diagnose';
  actionData?: Record<string, string>;
}

interface BookingFlowData {
  active: boolean;
  step: number;
  data: {
    service: string;
    problem: string;
    date: string;
    time: string;
    location: string;
    description: string;
  };
}

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  action: () => void;
}

export const AIDiagnosticBot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: "Hi! 👋 I'm Dumu Bot, your AI assistant. I can help you:\n\n• 🔧 Diagnose problems\n• 📅 Book appointments\n• 🔍 Find technicians\n• 💬 Answer questions\n\nHow can I help you today?",
      timestamp: new Date(),
      options: ['🔧 Diagnose Problem', '📅 Book Appointment', '🔍 Find Technician', '❓ Ask Question']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bookingFlow, setBookingFlow] = useState<BookingFlowData>({
    active: false,
    step: 0,
    data: {
      service: '',
      problem: '',
      date: '',
      time: '',
      location: '',
      description: ''
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickActions: QuickAction[] = [
    {
      icon: '📅',
      label: 'Book Now',
      description: 'Schedule a technician',
      action: () => {
        setBookingFlow({ active: true, step: 1, data: { service: '', problem: '', date: '', time: '', location: '', description: '' } });
        const response: Message = {
          id: Date.now().toString(),
          role: 'bot',
          content: "Great! Let's book an appointment for you.\n\n**Step 1/5:** What type of service do you need?",
          timestamp: new Date(),
          options: ['🔧 Plumbing', '⚡ Electrical', '🪵 Carpentry', '🔌 Appliance Repair', '🏠 General Maintenance']
        };
        setMessages(prev => [...prev, response]);
        setIsOpen(true);
      }
    },
    {
      icon: '🔍',
      label: 'Find Technicians',
      description: 'Browse available pros',
      action: () => {
        navigate('/find-technicians');
        setIsOpen(false);
      }
    },
    {
      icon: '💬',
      label: 'Get Support',
      description: 'Talk to support',
      action: () => {
        navigate('/support');
        setIsOpen(false);
      }
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBookingFlow = (userInput: string): Message => {
    const step = bookingFlow.step;
    const currentData = bookingFlow.data;

    switch (step) {
      case 1: // Service type selected
        setBookingFlow(prev => ({ ...prev, step: 2, data: { ...prev.data, service: userInput } }));
        return {
          id: Date.now().toString(),
          role: 'bot',
          content: `**Step 2/5:** Got it! You need **${userInput}**.\n\nPlease describe your problem in a few words.\n\nFor example:\n• "Kitchen faucet dripping"\n• "No power in living room"\n• "Door not closing properly"`,
          timestamp: new Date()
        };

      case 2: // Problem described
        setBookingFlow(prev => ({ ...prev, step: 3, data: { ...prev.data, problem: userInput } }));
        return {
          id: Date.now().toString(),
          role: 'bot',
          content: `**Step 3/5:** When would you like the technician to come?\n\nSelect a date or type "tomorrow", "this week", etc.`,
          timestamp: new Date(),
          options: ['Today', 'Tomorrow', 'This Week', 'Next Week']
        };

      case 3: // Date selected
        setBookingFlow(prev => ({ ...prev, step: 4, data: { ...prev.data, date: userInput } }));
        return {
          id: Date.now().toString(),
          role: 'bot',
          content: `**Step 4/5:** What time works best for you?\n\nWe have technicians available:\n• Morning (8AM - 12PM)\n• Afternoon (12PM - 4PM)\n• Evening (4PM - 8PM)`,
          timestamp: new Date(),
          options: ['Morning (8AM-12PM)', 'Afternoon (12PM-4PM)', 'Evening (4PM-8PM)', 'Anytime']
        };

      case 4: // Time selected
        setBookingFlow(prev => ({ ...prev, step: 5, data: { ...prev.data, time: userInput } }));
        return {
          id: Date.now().toString(),
          role: 'bot',
          content: `**Step 5/5:** Almost done! Please provide your location:\n\n• Enter your address\n• Or share your current location`,
          timestamp: new Date()
        };

      case 5: // Location provided - Complete booking
        const bookingData = {
          service: currentData.service,
          problem: currentData.problem,
          date: currentData.date,
          time: currentData.time,
          location: userInput
        };

        setBookingFlow(prev => ({ ...prev, step: 6, data: { ...prev.data, location: userInput } }));

        // Navigate to booking confirmation after a delay
        setTimeout(() => {
          navigate('/booking/create', { state: { prefilledData: bookingData } });
        }, 2500);

        return {
          id: Date.now().toString(),
          role: 'bot',
          content: `✅ **Perfect!** Here's your booking summary:\n\n**Service:** ${bookingData.service}\n**Issue:** ${bookingData.problem}\n**When:** ${bookingData.date} at ${bookingData.time}\n**Where:** ${userInput}\n\n🚀 I'm taking you to the confirmation page now...`,
          timestamp: new Date()
        };

      default:
        // Reset booking flow
        setBookingFlow({ active: false, step: 0, data: { service: '', problem: '', date: '', time: '', location: '', description: '' } });
        return {
          id: Date.now().toString(),
          role: 'bot',
          content: "Let's start over. What would you like to do?",
          timestamp: new Date(),
          options: ['📅 Book Appointment', '🔍 Find Technicians', '🔧 Diagnose Problem']
        };
    }
  };

  const generateBotResponse = (userInput: string, conversationHistory: Message[]): Message => {
    const input = userInput.toLowerCase();

    // Check for booking intent
    if (input.includes('book') || input.includes('appointment') || input.includes('schedule')) {
      setBookingFlow(prev => ({ ...prev, active: true, step: 1 }));
      return {
        id: Date.now().toString(),
        role: 'bot',
        content: "Great! I'll help you book an appointment. Let me ask a few questions:\n\n**Step 1/5:** What type of service do you need?",
        timestamp: new Date(),
        options: ['🔧 Plumbing', '⚡ Electrical', '🪵 Carpentry', '🔌 Appliance Repair', '🏠 General Maintenance']
      };
    }

    // Check for find technician intent
    if (input.includes('find') || input.includes('technician') || input.includes('search')) {
      return {
        id: Date.now().toString(),
        role: 'bot',
        content: "I'll help you find the right technician!\n\nYou can:\n• Browse all available technicians\n• Filter by service type\n• Check ratings and reviews\n\nWhat service are you looking for?",
        timestamp: new Date(),
        options: ['🔧 Plumbers', '⚡ Electricians', '🪵 Carpenters', '🔌 Appliance Repair'],
        action: 'navigate',
        actionData: { path: '/find-technicians' }
      };
    }

    // Check for pricing intent
    if (input.includes('price') || input.includes('cost') || input.includes('how much')) {
      return {
        id: Date.now().toString(),
        role: 'bot',
        content: "Here's our pricing guide:\n\n**Service Call:** KES 500-800\n**Plumbing:** KES 1,500-5,000\n**Electrical:** KES 2,000-6,000\n**Carpentry:** KES 1,500-4,000\n\nFinal price depends on:\n• Job complexity\n• Parts needed\n• Urgency\n\nWould you like a specific estimate?",
        timestamp: new Date(),
        options: ['Get Estimate', 'Book Appointment']
      };
    }

    // Problem detection - Plumbing
    if (input.includes('leak') || input.includes('dripping') || input.includes('water') || input.includes('faucet') || input.includes('pipe')) {
      return {
        id: Date.now().toString(),
        role: 'bot',
        content: "I understand you have a water leak issue. Let me help diagnose:\n\n📍 **Where is the leak?**\n• Faucet\n• Pipe\n• Toilet\n• Water heater\n\nOr would you like me to connect you with a plumber directly?",
        timestamp: new Date(),
        options: ['Faucet', 'Pipe', 'Toilet', 'Water Heater', 'Book Plumber Now'],
        action: 'booking',
        actionData: { service: 'Plumbing', problem: 'Leak' }
      };
    }

    // Problem detection - Electrical
    if (input.includes('power') || input.includes('electricity') || input.includes('outlet') || input.includes('switch') || input.includes('breaker')) {
      return {
        id: Date.now().toString(),
        role: 'bot',
        content: "I see you're having electrical issues. This is potentially dangerous. ⚠️\n\nQuick safety check:\n• Is there a burning smell? → **Turn off power immediately**\n• Are sparks visible? → **Emergency - call electrician**\n\nWhat type of electrical problem are you experiencing?",
        timestamp: new Date(),
        options: ['Outlet not working', 'Lights flickering', 'Circuit breaker trips', 'Burning smell', 'Book Electrician Now'],
        action: 'booking',
        actionData: { service: 'Electrical', problem: 'Power issue' }
      };
    }

    // Default helpful response
    return {
      id: Date.now().toString(),
      role: 'bot',
      content: "I'm here to help! Here's what I can do:\n\n1. 🔧 **Diagnose a problem** - Describe your issue\n2. 📅 **Book an appointment** - Schedule a technician\n3. 🔍 **Find technicians** - Browse available pros\n4. 💰 **Get estimates** - Check pricing\n\nWhat would you like to do?",
      timestamp: new Date(),
      options: ['Diagnose Problem', 'Book Appointment', 'Find Technicians', 'Check Pricing']
    };
  };

  const handleSendMessage = async (content?: string) => {
    const messageText = content || inputValue;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      let botResponse: Message;

      // Check if booking flow is active
      if (bookingFlow.active && bookingFlow.step > 0) {
        botResponse = handleBookingFlow(messageText);
      } else {
        botResponse = generateBotResponse(messageText, messages);
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleOptionClick = (option: string, message: Message) => {
    // Check for action-based options
    if (message.action === 'navigate' && message.actionData?.path) {
      navigate(message.actionData.path);
      setIsOpen(false);
      return;
    }

    if (message.action === 'booking' && message.actionData) {
      setBookingFlow({
        active: true,
        step: 2,
        data: {
          service: message.actionData.service || '',
          problem: message.actionData.problem || '',
          date: '',
          time: '',
          location: '',
          description: ''
        }
      });

      const response: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: `Great choice! Let's book a ${message.actionData.service} for you.\n\n**Step 2/5:** Please describe your ${message.actionData.problem?.toLowerCase() || 'problem'} in detail.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Handle special booking quick actions
    if (option === 'Book Plumber Now') {
      setBookingFlow({
        active: true,
        step: 2,
        data: { service: 'Plumbing', problem: 'Leak', date: '', time: '', location: '', description: '' }
      });
      const response: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: "Great choice! Let's book a Plumber for you.\n\n**Step 2/5:** Please describe the leak in detail.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    if (option === 'Book Electrician Now') {
      setBookingFlow({
        active: true,
        step: 2,
        data: { service: 'Electrical', problem: 'Power issue', date: '', time: '', location: '', description: '' }
      });
      const response: Message = {
        id: Date.now().toString(),
        role: 'bot',
        content: "Great choice! Let's book an Electrician for you.\n\n**Step 2/5:** Please describe the electrical issue in detail.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    // Handle navigation options
    if (option === '🔍 Find Technician' || option === 'Find Technicians') {
      navigate('/find-technicians');
      setIsOpen(false);
      return;
    }

    if (option === '❓ Ask Question' || option === 'Get Support') {
      navigate('/support');
      setIsOpen(false);
      return;
    }

    // Default: Send as message
    handleSendMessage(option);
  };

  return (
    <>
      {/* Quick Action Buttons (shown when chat is closed) */}
      {!isOpen && showQuickActions && (
        <div className="fixed bottom-36 md:bottom-32 right-4 md:right-8 flex flex-col gap-2 z-30">
          {quickActions.map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ scale: 0, x: 20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-full p-4 text-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
              title={action.label}
            >
              {action.icon}
            </motion.button>
          ))}
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            setShowQuickActions(false);
          }}
          onHoverStart={() => setShowQuickActions(true)}
          onHoverEnd={() => setShowQuickActions(false)}
          className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40",
              "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700",
              isMinimized ? "w-80" : "w-[calc(100vw-2rem)] md:w-[450px] h-[600px]"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Dumu Bot</h3>
                  <p className="text-xs text-white/80">AI Assistant • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setBookingFlow({ active: false, step: 0, data: { service: '', problem: '', date: '', time: '', location: '', description: '' } });
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="h-[calc(600px-180px)] overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'bot' && (
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full flex-shrink-0">
                          <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] p-3 rounded-2xl",
                          message.role === 'user'
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.options && (
                          <div className="mt-3 space-y-2">
                            {message.options.map((option, idx) => (
                              <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleOptionClick(option, message)}
                                className="w-full text-left px-3 py-2 bg-white dark:bg-gray-600 rounded-lg text-sm font-medium hover:shadow-md transition-all flex items-center justify-between group"
                              >
                                <span>{option}</span>
                                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                      {message.role === 'user' && (
                        <div className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Describe your problem or ask a question..."
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                      aria-label="Message input"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim()}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
