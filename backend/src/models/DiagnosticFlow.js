const mongoose = require('mongoose');

/**
 * Diagnostic Flow Model - Guides users through problem identification
 */
const DiagnosticFlowSchema = new mongoose.Schema({
  serviceCategory: {
    type: String,
    required: true,
    enum: ['Plumbing', 'Electrical', 'Carpentry', 'Appliance Repair', 'Painting', 'Cleaning', 'General']
  },
  problemName: {
    type: String,
    required: true
  },
  questions: [{
    id: String,
    question: String,
    type: {
      type: String,
      enum: ['text', 'single-choice', 'multiple-choice', 'image', 'yes-no', 'scale'],
      default: 'single-choice'
    },
    options: [{
      value: String,
      label: String,
      nextQuestionId: String, // For branching logic
      isDIYCandidate: Boolean, // If this answer might be solvable via DIY
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency']
      }
    }],
    required: Boolean,
    allowsMultiple: Boolean
  }],
  diySolutions: [{
    condition: {
      // Map of question IDs to answer values that trigger this DIY solution
      type: Map,
      of: String
    },
    title: String,
    description: String,
    steps: [String],
    tools: [String],
    materials: [String],
    estimatedTime: String,
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard']
    },
    safetyWarnings: [String]
  }],
  technicianPreparation: {
    // Information to help technicians come prepared
    likelyCauses: [String],
    toolsNeeded: [String],
    commonParts: [String],
    estimatedJobDuration: String,
    complexity: {
      type: String,
      enum: ['simple', 'moderate', 'complex']
    }
  },
  urgencyIndicators: [{
    questionId: String,
    answerValue: String,
    urgency: {
      type: String,
      enum: ['routine', 'urgent', 'emergency']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
DiagnosticFlowSchema.index({ serviceCategory: 1, isActive: 1 });
DiagnosticFlowSchema.index({ problemName: 'text' });

module.exports = mongoose.model('DiagnosticFlow', DiagnosticFlowSchema);
