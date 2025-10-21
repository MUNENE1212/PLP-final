/**
 * Debug script to check technician data
 * Run with: node debug-technician.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function debugTechnicians() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all technicians
    const technicians = await User.find({ role: 'technician' })
      .select('firstName lastName email status skills location availability')
      .lean();

    console.log(`Found ${technicians.length} technician(s) in database\n`);
    console.log('='.repeat(80));

    for (const tech of technicians) {
      console.log(`\n👤 TECHNICIAN: ${tech.firstName} ${tech.lastName}`);
      console.log(`   Email: ${tech.email}`);
      console.log(`   ID: ${tech._id}`);
      console.log(`   Status: ${tech.status}`);

      console.log('\n📍 LOCATION:');
      if (tech.location) {
        console.log(`   Type: ${tech.location.type}`);
        console.log(`   Coordinates: ${tech.location.coordinates}`);
        console.log(`   City: ${tech.location.city || 'Not set'}`);
        console.log(`   County: ${tech.location.county || 'Not set'}`);
        console.log(`   Country: ${tech.location.country || 'Not set'}`);
        console.log(`   Address: ${tech.location.address || 'Not set'}`);

        if (!tech.location.coordinates || tech.location.coordinates.length !== 2) {
          console.log('   ❌ WARNING: Coordinates are missing or invalid!');
        } else if (tech.location.coordinates[0] === 0 && tech.location.coordinates[1] === 0) {
          console.log('   ❌ WARNING: Coordinates are set to [0, 0] (not a real location)');
        } else {
          console.log('   ✅ Coordinates look valid');
        }
      } else {
        console.log('   ❌ WARNING: No location data set!');
      }

      console.log('\n🛠️  SKILLS:');
      if (tech.skills && tech.skills.length > 0) {
        tech.skills.forEach((skill, index) => {
          console.log(`   ${index + 1}. Name: ${skill.name}`);
          console.log(`      Category: ${skill.category}`);
          console.log(`      Years of Experience: ${skill.yearsOfExperience || 'Not set'}`);
          console.log(`      Verified: ${skill.verified ? 'Yes' : 'No'}`);
        });

        // Check for electrical skill
        const hasElectrical = tech.skills.some(s => s.category === 'electrical');
        if (hasElectrical) {
          console.log('   ✅ Has ELECTRICAL skill');
        } else {
          console.log('   ❌ Does NOT have ELECTRICAL skill');
          console.log('   Available categories:', tech.skills.map(s => s.category).join(', '));
        }
      } else {
        console.log('   ❌ WARNING: No skills set!');
      }

      console.log('\n📅 AVAILABILITY:');
      if (tech.availability) {
        console.log(`   Is Available: ${tech.availability.isAvailable ? 'Yes' : 'No'}`);
        if (tech.availability.schedule && tech.availability.schedule.length > 0) {
          console.log(`   Schedule: ${tech.availability.schedule.length} time slots`);
        } else {
          console.log('   Schedule: Not set');
        }
      } else {
        console.log('   ⚠️  Availability not set');
      }

      console.log('\n' + '='.repeat(80));
    }

    // Now test the query that matching uses
    console.log('\n\n🔍 TESTING MATCHING QUERY FOR ELECTRICAL SERVICES:\n');

    const matchingQuery = {
      role: 'technician',
      status: 'active',
      'skills.category': 'electrical',
      'location.coordinates': { $exists: true, $ne: null }
    };

    console.log('Query:', JSON.stringify(matchingQuery, null, 2));

    const matchingTechs = await User.find(matchingQuery)
      .select('firstName lastName skills location')
      .lean();

    console.log(`\nResult: Found ${matchingTechs.length} technician(s) matching the query`);

    if (matchingTechs.length > 0) {
      matchingTechs.forEach(tech => {
        console.log(`  ✅ ${tech.firstName} ${tech.lastName}`);
      });
    } else {
      console.log('\n❌ No technicians found with matching query!');
      console.log('\nPossible reasons:');
      console.log('  1. Status is not "active"');
      console.log('  2. No skill with category "electrical"');
      console.log('  3. Location coordinates not set or null');
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the debug script
debugTechnicians();
