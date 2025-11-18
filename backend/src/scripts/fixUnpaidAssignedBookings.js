const mongoose = require('mongoose');
const Booking = require('../models/Booking');
require('dotenv').config();

/**
 * Fix bookings that have 'assigned' status but unpaid booking fees
 * This script resets them to 'pending' and moves technician to preferredTechnician
 */
async function fixUnpaidAssignedBookings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find bookings with 'assigned' status but unpaid booking fees
    const problematicBookings = await Booking.find({
      status: 'assigned',
      'bookingFee.status': { $in: ['pending', 'failed'] }
    }).populate('technician customer', 'firstName lastName email');

    console.log(`\n📋 Found ${problematicBookings.length} bookings with unpaid fees but 'assigned' status\n`);

    if (problematicBookings.length === 0) {
      console.log('✅ No bookings need fixing!');
      process.exit(0);
    }

    // Display bookings that will be fixed
    console.log('📝 Bookings to be fixed:');
    problematicBookings.forEach((booking, index) => {
      console.log(`\n${index + 1}. Booking #${booking.bookingNumber}`);
      console.log(`   Customer: ${booking.customer?.firstName} ${booking.customer?.lastName}`);
      console.log(`   Technician: ${booking.technician?.firstName} ${booking.technician?.lastName}`);
      console.log(`   Status: ${booking.status}`);
      console.log(`   Booking Fee Status: ${booking.bookingFee?.status}`);
    });

    // Ask for confirmation
    console.log('\n⚠️  This will:');
    console.log('   - Reset status from "assigned" to "pending"');
    console.log('   - Move technician to preferredTechnician');
    console.log('   - Keep booking fee requirement active');
    console.log('\nStarting fix in 3 seconds...\n');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Fix each booking
    let fixed = 0;
    for (const booking of problematicBookings) {
      try {
        // Move technician to preferredTechnician if not already set
        if (booking.technician && !booking.preferredTechnician) {
          booking.preferredTechnician = booking.technician;
          booking.technician = undefined; // Unassign technician
        }

        // Reset status to pending
        booking.status = 'pending';

        // Add to status history
        booking.statusHistory.push({
          status: 'pending',
          changedBy: booking.customer, // Use customer as the changer
          changedAt: new Date(),
          reason: 'System fix: Reset to pending due to unpaid booking fee',
          notes: 'Automated fix for bookings assigned without payment verification'
        });

        await booking.save();
        console.log(`✅ Fixed: ${booking.bookingNumber}`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing ${booking.bookingNumber}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully fixed ${fixed} out of ${problematicBookings.length} bookings`);
    console.log('\n💡 Users can now complete payment to proceed with technician assignment');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
}

// Run the fix
fixUnpaidAssignedBookings();
