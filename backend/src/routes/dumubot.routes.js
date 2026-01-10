const express = require('express');
const router = express.Router();
const DumuBotController = require('../controllers/dumubot.controller');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Instantiate DumuBot
const DumuBot = new DumuBotController();

// Chat endpoint (public - no auth required)
router.post('/chat', async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { message } = req.body;
    const user = req.user || null; // User may be null for public requests

    // Check for FAQ match first (faster than AI)
    const faqResult = await DumuBot.searchFAQ(message);

    if (faqResult.found) {
      return res.json({
        success: true,
        response: faqResult.answer,
        source: 'faq',
        category: faqResult.category
      });
    }

    // Check for technician recommendation request
    if (message.toLowerCase().includes('find') &&
        (message.toLowerCase().includes('technician') || message.toLowerCase().includes('plumber') ||
         message.toLowerCase().includes('electrician') || message.toLowerCase().includes('carpenter'))) {

      // Extract service type from message
      const serviceMatch = message.match(/plumber|electrical|carpenter|painter|cleaner|appliance/i);
      const service = serviceMatch ? serviceMatch[0].charAt(0).toUpperCase() + serviceMatch[0].slice(1) : null;

      if (service) {
        const techResult = await DumuBot.getTechnicianRecommendations(service, user?.location?.city || 'Nairobi');

        if (techResult.found) {
          const techList = techResult.technicians.map(t =>
            `• ${t.name} (${t.specialties}) - ${t.rating}★`
          ).join('\n');

          return res.json({
            success: true,
            response: `Here are our top-rated ${service}s in ${user?.location?.city || 'your area'}:\n\n${techList}\n\nWould you like me to help you book one of them?`,
            source: 'technician-search',
            technicians: techResult.technicians
          });
        }
      }
    }

    // Build user context (handle both authenticated and public users)
    const context = {
      userName: user?.firstName || 'Guest',
      userRole: user?.role || 'guest',
      userId: user?._id || 'guest',
      location: user?.location || null,
      bookings: user?.role === 'customer'
        ? await require('../models/Booking').find({ customer: user._id }).limit(3).select('serviceCategory status')
        : null
    };

    // Use AI for general conversation
    const result = await DumuBot.chat(message, user?._id || 'guest', context);

    return res.json(result);

  } catch (error) {
    console.error('DumuBot chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, DumuBot is having trouble right now. Please try again or contact support@dumuwaks.com'
    });
  }
});

// Quick action endpoints
router.post('/action/:action', protect, async (req, res) => {
  try {
    const { action } = req.params;
    const user = req.user;

    switch (action) {
      case 'find-technician':
        return res.json({
          success: true,
          response: "I'll help you find a technician! 🔧\n\nWhat service do you need? (e.g., 'I need a plumber in Nairobi')\n\nI can search for:\n• Plumbers\n• Electricians\n• Carpenters\n• Painters\n• Cleaners\n• Appliance Repair Technicians",
          source: 'action',
          action: 'technician-search'
        });

      case 'track-booking':
        const Booking = require('../models/Booking');
        const latestBooking = await Booking.findOne({
          $or: [
            { customer: user._id },
            { technician: user._id }
          ]
        }).sort({ createdAt: -1 });

        if (latestBooking) {
          const status = latestBooking.status === 'completed' ? '✅ Completed' :
                       latestBooking.status === 'pending' ? '⏳ Pending' :
                       latestBooking.status === 'confirmed' ? '✓ Confirmed' :
                       latestBooking.status === 'in-progress' ? '🔧 In Progress' : latestBooking.status;

          return res.json({
            success: true,
            response: `Your latest booking:\n\n📋 Service: ${latestBooking.serviceCategory || 'General'}\n${status}\n📅 Scheduled: ${latestBooking.scheduledDate ? new Date(latestBooking.scheduledDate).toLocaleDateString() : 'To be scheduled'}\n\nNeed more details? I can help with that!`,
          });
        } else {
          return res.json({
            success: true,
            response: "You don't have any bookings yet. Would you like me to help you find a technician and create your first booking? 🔧",
          });
        }

      case 'how-it-works':
        return res.json({
          success: true,
          response: `Here's how Dumu Waks works 🇰🇪:\n\n1️⃣ **Describe Your Problem**\nTell us what you need fixed and where you are.\n\n2️⃣ **Get Matched**\nOur AI matches you with the best technician in under 60 seconds.\n\n3️⃣ **Book & Pay**\nSchedule your service and pay securely via M-Pesa.\n\n4️⃣ **Get It Done**\nTechnician completes the job.\n\n5️⃣ **Review & Pay**\nReview the work, we release payment to technician.\n\n💰 Money held in escrow until you're satisfied!\n\nWant to try it out? Let me help you find a technician!`,
          source: 'action'
        });

      case 'pricing':
        return res.json({
          success: true,
          response: `Our pricing is transparent and fair 💰\n\n**How it works:**\n• Technicians set their own rates\n• You see the EXACT price before booking\n• No hidden fees or surprises\n• Pay via M-Pesa when you book\n• Money held in escrow until job complete\n\n**Typical price ranges:**\n• Plumbing: KES 500 - 5,000\n• Electrical: KES 500 - 5,000\n• Carpentry: KES 1,000 - 10,000\n• Painting: KES 2,000 - 15,000\n• Cleaning: KES 500 - 3,000\n\nExact price depends on the job. Want me to help you get a quote?`,
          source: 'action'
        });

      case 'get-support':
        return res.json({
          success: true,
          response: "I'm connecting you to our support team! 🆘\n\nYou can reach them at:\n\n📧 Email: support@dumuwaks.com\n📱 Phone: +254 XXX XXX XXX\n\nOr fill out the contact form on our website.\n\nOur team typically responds within 1 hour during business hours.",
          source: 'action'
        });

      case 'become-technician':
        return res.json({
          success: true,
          response: "Great choice! We'd love to have you on board! 🛠️\n\n**Requirements:**\n✓ Valid National ID\n✓ Verifiable skills & experience\n✓ Good reputation\n✓ Professional tools\n✓ M-Pesa account for payments\n\n**Benefits:**\n• Get matched with customers automatically\n• Receive payments securely via M-Pesa\n• Build your reputation with reviews\n• Flexible schedule - work when you want\n• Earn great income!\n\nReady to join? Register at: /register?role=technician",
          source: 'action'
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Unknown action'
        });
    }
  } catch (error) {
    console.error('DumuBot action error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, something went wrong'
    });
  }
});

// Get conversation history
router.get('/history', protect, async (req, res) => {
  const user = req.user;
  const history = DumuBot.chatHistory.get(user._id.toString()) || [];

  res.json({
    success: true,
    data: {
      messages: history,
      count: history.length
    }
  });
});

// Clear conversation history
router.delete('/history', protect, async (req, res) => {
  const user = req.user;
  DumuBot.clearHistory(user._id);

  res.json({
    success: true,
    message: 'Conversation history cleared'
  });
});

module.exports = router;
