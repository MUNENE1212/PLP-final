# Email Automation & DumuBot AI - Implementation Guide

## Quick Start: Brevo SMTP Configuration

### 1. Update .env with Brevo Settings
```env
# Brevo (formerly Sendinblue) SMTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login@email.com
SMTP_PASS=your-brevo-api-key
EMAIL_FROM=noreply@dumuwaks.com
EMAIL_FROM_NAME=Dumu Waks
```

### 2. Get Brevo Credentials
1. Go to https://www.brevo.com
2. Sign up/login
3. Go to SMTP & API → Your SMTP Keys
4. Create new SMTP key
5. Copy login (email) and key (password)

### 3. Install Nodemailer
```bash
npm install nodemailer
```

### 4. Test Email Sending
```javascript
// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: `"Dumu Waks" <${process.env.EMAIL_FROM}>`,
    to: 'your-email@example.com',
    subject: 'Test Email from Dumu Waks',
    html: '<h1>Success!</h1><p>Email is working!</p>'
  });

  console.log('✅ Email sent:', info.messageId);
}

testEmail();
```

Run: `node test-email.js`

## Email Automation Workflows

### Workflow 1: User Registration
```
User Signs Up
  ↓
Send Verification Email (with token)
  ↓
User Clicks Link
  ↓
Mark as Verified
  ↓
Send Welcome Email
```

### Workflow 2: Booking Created
```
Customer Creates Booking
  ↓
Email Customer: Confirmation
  ↓
Email Technician: New Request
  ↓
Technician Accepts
  ↓
Email Customer: Technician Accepted
```

### Workflow 3: Service Completed
```
Booking Marked Complete
  ↓
Wait 24 hours
  ↓
Send Review Request Email
  ↓
Customer Leaves Review
  ↓
Email Technician: New Review!
```

### Workflow 4: Password Reset
```
User Requests Reset
  ↓
Generate Reset Token (1 hour expiry)
  ↓
Send Reset Email
  ↓
User Resets Password
  ↓
Send Password Changed Confirmation
```

## Automated Email Sequences

### Welcome Sequence (New Users)
**Day 0:** Welcome email + profile completion CTA
**Day 2:** Tips for getting best results
**Day 7:** Check-in + offer help
**Day 30:** Success stories + referral request

### Re-engagement Sequence (Inactive Users)
**Email 1:** We miss you! Here's what's new
**Email 2:** Special offer to come back
**Email 3:** Last chance + discount

## DumuBot AI - Intelligent Chatbot

### Architecture

```javascript
// dumubot.controller.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

class DumuBot {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async chat(message, context = {}) {
    const systemPrompt = this.buildSystemPrompt(context);
    const prompt = `${systemPrompt}\n\nUser: ${message}\n\nDumuBot:`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  buildSystemPrompt(context) {
    return `You are DumuBot, the friendly AI assistant for Dumu Waks - a Kenyan maintenance and repair platform.

Key Information:
- Platform: Dumu Waks
- Services: Plumbing, Electrical, Carpentry, Appliance Repair, Painting, Cleaning
- Payment: M-Pesa with escrow protection
- Coverage: All Kenya
- Language: English and Swahili

Your Role:
- Help users find technicians
- Explain how Dumu Waks works
- Assist with bookings
- Provide tips and advice
- Be friendly, helpful, and professional

Context:
${JSON.stringify(context, null, 2)}

Guidelines:
- Be concise but helpful
- Use emojis occasionally 🇰🇪
- If you don't know something, be honest
- Escalate complex issues to human support
- Always maintain a positive, professional tone`;
  }

  async getFAQAnswer(question) {
    // Fetch FAQ from database
    const faq = await FAQ.findOne({
      $or: [
        { question: { $regex: question, $options: 'i' } },
        { keywords: { $in: [question.toLowerCase()] } }
      ]
    });

    return faq ? faq.answer : null;
  }

  async getTechnicianRecommendation(service, location) {
    // Call matching algorithm
    const response = await axios.post('/api/v1/matching/find', {
      service,
      location,
      limit: 3
    });

    return response.data.data.technicians;
  }
}

module.exports = DumuBot;
```

### DumuBot API Endpoint

```javascript
// routes/dumubot.routes.js
const express = require('express');
const router = express.Router();
const DumuBot = require('../controllers/dumubot.controller');
const { protect } = require('../middleware/auth');

// Chat endpoint
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    // Build context
    const context = {
      userName: user.firstName,
      userRole: user.role,
      userId: user._id,
      bookings: await Booking.find({ customer: user._id }).limit(5).select('serviceCategory status'),
      location: user.location
    };

    // Check for FAQ match first
    const faqAnswer = await DumuBot.getFAQAnswer(message);
    if (faqAnswer) {
      return res.json({
        success: true,
        response: faqAnswer,
        source: 'faq'
      });
    }

    // Use AI if no FAQ match
    const response = await DumuBot.chat(message, context);

    res.json({
      success: true,
      response,
      source: 'ai'
    });
  } catch (error) {
    console.error('DumuBot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, DumuBot is having trouble. Please try again.'
    });
  }
});

// Quick actions
router.post('/action/:action', protect, async (req, res) => {
  const { action } = req.params;
  const user = req.user;

  switch(action) {
    case 'find-technician':
      // Trigger technician search flow
      break;
    case 'track-booking':
      // Get latest booking status
      break;
    case 'get-support':
      // Connect to human support
      break;
    default:
      res.status(400).json({ success: false, message: 'Unknown action' });
  }
});

module.exports = router;
```

### DumuBot Frontend Component

```typescript
// components/chat/DumuBotChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import axios from '@/lib/axios';

export const DumuBotChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
  }>>([
    {
      role: 'bot',
      text: 'Habari! 👋 I\'m DumuBot, your friendly assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user' as const,
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/v1/dumubot/chat', {
        message: inputMessage
      });

      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: response.data.response,
          timestamp: new Date()
        }]);
        setIsTyping(false);
        scrollToBottom();
      }, 1000);
    } catch (error) {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { label: 'Find a Technician', message: 'I need to find a technician' },
    { label: 'Track My Booking', message: 'What\'s the status of my booking?' },
    { label: 'How It Works', message: 'How does Dumu Waks work?' },
    { label: 'Pricing', message: 'What are your prices?' }
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">DumuBot</h3>
                <p className="text-xs text-white/80">AI Assistant 🇰🇪</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-neutral-700 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(action.message)}
                    className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask DumuBot anything..."
                className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-full focus:ring-2 focus:ring-purple-500 bg-transparent dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
```

## Integration Steps

1. **Configure Brevo SMTP** - Update .env with credentials
2. **Install Dependencies** - `npm install nodemailer @google/generative-ai`
3. **Test Email** - Run test script
4. **Register Routes** - Add to server.js
5. **Add DumuBot** - Import component to Layout
6. **Test Chat** - Start chatting!

## Files to Create

- `/backend/src/services/email.service.js`
- `/backend/src/controllers/dumubot.controller.js`
- `/backend/src/routes/dumubot.routes.js`
- `/frontend/src/components/chat/DumuBotChat.tsx`

## Features

**Email System:**
- ✅ Welcome emails
- ✅ Email verification
- ✅ Password reset
- ✅ Booking notifications
- ✅ Review requests
- ✅ Automated sequences

**DumuBot AI:**
- ✅ Natural conversations
- ✅ FAQ knowledge base
- ✅ Technician recommendations
- ✅ Booking tracking
- ✅ Multi-language support
- ✅ Smart escalation to humans
