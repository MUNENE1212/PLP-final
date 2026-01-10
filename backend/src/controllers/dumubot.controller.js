require('dotenv').config();
const { CohereClientV2 } = require('cohere-ai');
const FAQ = require('../models/FAQ');

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY
});

/**
 * DumuBot - Intelligent AI Assistant for Dumu Waks
 * Powered by Cohere AI (Command R Plus)
 */
class DumuBot {
  constructor() {
    this.chatHistory = new Map(); // Store conversation history per user
  }

  /**
   * Main chat function using Cohere Chat API V2
   */
  async chat(message, userId, context = {}) {
    try {
      // Get or create chat history for this user
      let history = this.chatHistory.get(userId.toString()) || [];

      // Build system prompt with context
      const systemPrompt = this.buildSystemPrompt(context);

      // Build messages array for Cohere V2 API
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...history,
        {
          role: 'user',
          content: message
        }
      ];

      // Call Cohere Chat API V2
      const response = await cohere.chat({
        model: process.env.COHERE_MODEL || 'command-r-plus',
        messages: messages,
        temperature: 0.7,
        maxTokens: 500
      });

      // Extract bot response
      const botMessage = response.message?.content?.[0]?.text || response.text || "I'm sorry, I couldn't generate a response.";

      // Add conversation to history
      history.push(
        { role: 'user', content: message },
        { role: 'assistant', content: botMessage }
      );

      // Keep last 10 messages to manage context window (excluding system prompt)
      if (history.length > 10) {
        history = history.slice(-10);
      }

      // Save updated history
      this.chatHistory.set(userId.toString(), history);

      return {
        success: true,
        response: botMessage,
        sources: response.documents || []
      };
    } catch (error) {
      console.error('DumuBot error:', error);
      return {
        success: false,
        response: "I'm having trouble right now. Please try again or contact support@dumuwaks.com",
        error: error.message
      };
    }
  }

  /**
   * Build system prompt with platform knowledge
   */
  buildSystemPrompt(context) {
    const { userName, userRole, bookings } = context;

    let prompt = `You are DumuBot, the friendly and intelligent AI assistant for Dumu Waks - Kenya's trusted maintenance and repair platform.

🇰🇪 PLATFORM OVERVIEW:
- Name: Dumu Waks (Professional Maintenance & Repair Services)
- Services: Plumbing, Electrical, Carpentry, Appliance Repair, Painting, Cleaning
- Payment: M-Pesa with escrow protection (money held safe until job complete)
- Coverage: All Kenya
- Language: English and Swahili

YOUR CAPABILITIES:
- Help users find verified technicians
- Explain how Dumu Waks works
- Assist with booking tracking
- Provide pricing information
- Answer FAQs
- Offer tips and advice
- Be friendly, helpful, and professional
- Use emojis occasionally to add warmth 🌟

KEY FEATURES TO MENTION:
- ✅ Verified technicians (ID checked, skills assessed)
- ✅ Transparent pricing (see exact cost before booking)
- ✅ Secure M-Pesa payments with escrow
- ✅ Dispute resolution support
- ✅ Real customer reviews only
- ✅ Satisfaction guaranteed

`;

    // Add personalized context
    if (userName) {
      prompt += `\nUSER CONTEXT:\n- Talking to: ${userName}\n- Role: ${userRole || 'customer'}`;
    }

    // Add booking context if available
    if (bookings && bookings.length > 0) {
      prompt += `\n- Recent bookings: ${bookings.map(b => `${b.serviceCategory} (${b.status})`).join(', ')}`;
    }

    prompt += `\n\nGUIDELINES:
- Be concise but helpful
- If you don't know something, be honest
- For complex issues, suggest contacting human support
- Always maintain a positive, professional tone
- If user asks about pricing, explain it depends on the job
- Recommend verified technicians only
- Escalate safety concerns immediately
- Support both English and basic Swahili`;

    return prompt;
  }

  /**
   * Search FAQ database for quick answers
   */
  async searchFAQ(question) {
    try {
      const keywords = question.toLowerCase().split(' ');

      const faq = await FAQ.findOne({
        $or: [
          { question: { $regex: question, $options: 'i' } },
          { keywords: { $in: keywords } },
          { category: { $regex: question, $options: 'i' } }
        ],
        isActive: true
      });

      if (faq) {
        return {
          found: true,
          answer: faq.answer,
          category: faq.category
        };
      }

      return { found: false };
    } catch (error) {
      console.error('FAQ search error:', error);
      return { found: false };
    }
  }

  /**
   * Get technician recommendations
   */
  async getTechnicianRecommendations(service, location) {
    try {
      const axios = require('axios');

      const response = await axios.post('/api/v1/matching/find', {
        serviceCategory: service,
        location: location,
        limit: 3,
        sortBy: 'rating'
      });

      if (response.data.success && response.data.data.technicians.length > 0) {
        const techs = response.data.data.technicians;
        return {
          found: true,
          technicians: techs.map(t => ({
            name: `${t.firstName} ${t.lastName}`,
            rating: t.rating?.average || 0,
            specialties: t.skills?.slice(0, 3).join(', ') || 'General',
            location: t.location?.city || 'Kenya'
          }))
        };
      }

      return { found: false };
    } catch (error) {
      console.error('Technician recommendation error:', error);
      return { found: false };
    }
  }

  /**
   * Get booking status
   */
  async getBookingStatus(bookingId, userId) {
    try {
      const axios = require('axios');
      const Booking = require('../models/Booking');

      const booking = await Booking.findOne({
        _id: bookingId,
        $or: [
          { customer: userId },
          { technician: userId }
        ]
      }).populate('technician customer').populate('serviceCategory');

      if (booking) {
        return {
          found: true,
          status: booking.status,
          serviceType: booking.serviceCategory?.name || booking.serviceType,
          scheduledDate: booking.scheduledDate,
          technician: booking.technician ? `${booking.technician.firstName} ${booking.technician.lastName}` : null
        };
      }

      return { found: false };
    } catch (error) {
      console.error('Booking status error:', error);
      return { found: false };
    }
  }

  /**
   * Clear chat history (for logout or privacy)
   */
  clearHistory(userId) {
    this.chatHistory.delete(userId.toString());
  }
}

module.exports = DumuBot;
