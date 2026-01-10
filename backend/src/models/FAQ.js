const mongoose = require('mongoose');

/**
 * FAQ Model - Frequently Asked Questions for DumuBot
 * Stores common questions and answers for quick responses
 */
const FAQSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'booking', 'payment', 'pricing', 'services', 'technicians', 'account', 'support'],
    default: 'general'
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
FAQSchema.index({ question: 'text', answer: 'text' });
FAQSchema.index({ keywords: 1 });
FAQSchema.index({ category: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('FAQ', FAQSchema);
