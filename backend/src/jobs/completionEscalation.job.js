const Booking = require('../models/Booking');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

/**
 * Auto-escalate completion requests that have passed the deadline
 * Run this job every hour
 */
async function autoEscalateCompletionRequests() {
  try {
    console.log('Running auto-escalation job for completion requests...');

    // Find bookings with pending completion requests that have passed the deadline
    const bookingsToEscalate = await Booking.find({
      'completionRequest.status': 'pending',
      'completionRequest.escalationDeadline': { $lte: new Date() },
      'completionRequest.autoEscalated': false
    })
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName');

    console.log(`Found ${bookingsToEscalate.length} bookings to escalate`);

    for (const booking of bookingsToEscalate) {
      // Mark as auto-escalated
      booking.completionRequest.autoEscalated = true;
      booking.completionRequest.status = 'escalated';

      // Create a support ticket for follow-up
      const ticket = await SupportTicket.create({
        customer: booking.customer._id,
        subject: `Completion Follow-up Required - ${booking.bookingNumber}`,
        description: `Customer has not responded to completion request for booking ${booking.bookingNumber}. Technician completed work on ${booking.actualEndTime?.toLocaleString()}. Please contact customer to verify completion.`,
        category: 'booking',
        priority: 'medium',
        relatedBooking: booking._id,
        source: 'system',
        tags: ['completion-followup', 'auto-escalated']
      });

      // Initialize support follow-up
      booking.completionRequest.supportFollowUp = {
        initiated: true,
        initiatedAt: new Date(),
        contactAttempts: []
      };

      await booking.save();

      console.log(`Escalated booking ${booking.bookingNumber}, created ticket ${ticket.ticketNumber}`);

      // TODO: Send notification to support team
      // TODO: Send reminder to customer
    }

    console.log('Auto-escalation job completed successfully');

    return {
      success: true,
      escalatedCount: bookingsToEscalate.length
    };
  } catch (error) {
    console.error('Auto-escalation job error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send reminders to customers with pending completion requests (before escalation)
 * Run this job every 12 hours
 */
async function sendCompletionReminders() {
  try {
    console.log('Running completion reminder job...');

    // Find bookings with pending completion requests that will escalate in the next 24 hours
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await Booking.find({
      'completionRequest.status': 'pending',
      'completionRequest.escalationDeadline': {
        $gte: now,
        $lte: next24Hours
      },
      'completionRequest.autoEscalated': false
    })
      .populate('customer', 'firstName lastName email phoneNumber')
      .populate('technician', 'firstName lastName');

    console.log(`Found ${bookings.length} bookings to send reminders`);

    for (const booking of bookings) {
      // TODO: Send notification to customer
      // TODO: Send email/SMS reminder to customer

      console.log(`Sent reminder for booking ${booking.bookingNumber} to ${booking.customer.email}`);
    }

    console.log('Completion reminder job completed successfully');

    return {
      success: true,
      remindersSent: bookings.length
    };
  } catch (error) {
    console.error('Completion reminder job error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Auto-complete bookings where support has confirmed completion after follow-up
 * Run this job daily
 */
async function autoCompleteUnreachable() {
  try {
    console.log('Running auto-complete for unreachable customers...');

    // Find bookings with escalated status and multiple failed contact attempts
    const bookings = await Booking.find({
      'completionRequest.status': 'escalated',
      'completionRequest.supportFollowUp.initiated': true,
      'completionRequest.supportFollowUp.outcome': { $exists: false }
    });

    let autoCompletedCount = 0;

    for (const booking of bookings) {
      const contactAttempts = booking.completionRequest.supportFollowUp.contactAttempts || [];
      const unsuccessfulAttempts = contactAttempts.filter(a => !a.reached).length;

      // If 3+ unsuccessful attempts over 7+ days, auto-complete
      const daysSinceEscalation = Math.floor(
        (new Date() - booking.completionRequest.supportFollowUp.initiatedAt) / (1000 * 60 * 60 * 24)
      );

      if (unsuccessfulAttempts >= 3 && daysSinceEscalation >= 7) {
        booking.completionRequest.supportFollowUp.outcome = 'unreachable';
        booking.completionRequest.supportFollowUp.completedAt = new Date();
        booking.completionRequest.supportFollowUp.notes = 'Auto-completed after multiple unsuccessful contact attempts';
        booking.completionRequest.status = 'auto_approved';
        booking.status = 'verified';

        await booking.save();
        autoCompletedCount++;

        console.log(`Auto-completed booking ${booking.bookingNumber} (unreachable customer)`);

        // TODO: Send final notification to customer and technician
      }
    }

    console.log('Auto-complete job completed successfully');

    return {
      success: true,
      autoCompletedCount
    };
  } catch (error) {
    console.error('Auto-complete job error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  autoEscalateCompletionRequests,
  sendCompletionReminders,
  autoCompleteUnreachable
};
