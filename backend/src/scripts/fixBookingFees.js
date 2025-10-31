const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

/**
 * Fix existing bookings that don't have bookingFee.amount set
 * Calculates 20% of totalAmount and updates the booking
 */
async function fixBookingFees() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find bookings with missing or zero booking fee amount
    const bookingsToFix = await Booking.find({
      $or: [
        { 'bookingFee.amount': { $exists: false } },
        { 'bookingFee.amount': null },
        { 'bookingFee.amount': 0 }
      ],
      'pricing.totalAmount': { $exists: true, $gt: 0 }
    });

    console.log(`Found ${bookingsToFix.length} bookings to fix\n`);

    if (bookingsToFix.length === 0) {
      console.log('✅ All bookings already have booking fee amounts set!');
      process.exit(0);
    }

    let fixed = 0;
    let failed = 0;

    for (const booking of bookingsToFix) {
      try {
        const totalAmount = booking.pricing.totalAmount;
        const bookingFeeAmount = Math.round(totalAmount * 0.20 * 100) / 100; // 20% of total

        // Initialize bookingFee if it doesn't exist
        booking.bookingFee = booking.bookingFee || {};

        // Set/update booking fee fields
        booking.bookingFee.amount = bookingFeeAmount;
        booking.bookingFee.percentage = 20;
        booking.bookingFee.status = booking.bookingFee.status || 'pending';
        booking.bookingFee.required = true;

        await booking.save();

        console.log(`✅ Fixed booking ${booking.bookingNumber}:`);
        console.log(`   Total: ${totalAmount} KES`);
        console.log(`   Booking Fee: ${bookingFeeAmount} KES (20%)`);
        console.log(`   Status: ${booking.bookingFee.status}\n`);

        fixed++;
      } catch (error) {
        console.error(`❌ Failed to fix booking ${booking.bookingNumber}:`, error.message);
        failed++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total found: ${bookingsToFix.length}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Failed: ${failed}`);
    console.log('===============\n');

    if (fixed > 0) {
      console.log('✅ Booking fees fixed successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing booking fees:', error);
    process.exit(1);
  }
}

// Run the script
fixBookingFees();
