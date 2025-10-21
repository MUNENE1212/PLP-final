/**
 * Debug script to test the exact query used in matching
 * Run with: node debug-query.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function debugQuery() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test the EXACT query from the logs
    const matchingQuery = {
      role: 'technician',
      status: 'active',
      'skills.category': 'electrical',
      'location.coordinates': { $exists: true, $ne: null }
    };

    console.log('Testing EXACT query from logs:');
    console.log(JSON.stringify(matchingQuery, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    const technicians = await User.find(matchingQuery)
      .select('firstName lastName email status skills location')
      .lean();

    console.log(`Result: Found ${technicians.length} technician(s)\n`);

    if (technicians.length === 0) {
      console.log('❌ NO TECHNICIANS FOUND! Let\'s investigate why...\n');

      // Test each condition separately
      console.log('Testing individual conditions:\n');

      // 1. Role = technician
      const techCount = await User.countDocuments({ role: 'technician' });
      console.log(`1. role: 'technician' → ${techCount} users`);

      // 2. Status = active
      const activeCount = await User.countDocuments({ role: 'technician', status: 'active' });
      console.log(`2. + status: 'active' → ${activeCount} users`);

      // 3. Has electrical skill
      const electricalCount = await User.countDocuments({
        role: 'technician',
        status: 'active',
        'skills.category': 'electrical'
      });
      console.log(`3. + skills.category: 'electrical' → ${electricalCount} users`);

      // 4. Has location coordinates
      const withLocationCount = await User.countDocuments({
        role: 'technician',
        status: 'active',
        'skills.category': 'electrical',
        'location.coordinates': { $exists: true }
      });
      console.log(`4. + location.coordinates exists → ${withLocationCount} users`);

      // 5. Location coordinates not null
      const withNonNullLocationCount = await User.countDocuments({
        role: 'technician',
        status: 'active',
        'skills.category': 'electrical',
        'location.coordinates': { $exists: true, $ne: null }
      });
      console.log(`5. + location.coordinates not null → ${withNonNullLocationCount} users`);

      // Let's also check what the actual data looks like
      console.log('\n' + '='.repeat(80) + '\n');
      console.log('Let\'s see what the technician data actually looks like:\n');

      const allTechs = await User.find({ role: 'technician' })
        .select('firstName lastName status skills location')
        .lean();

      allTechs.forEach((tech, index) => {
        console.log(`\nTechnician ${index + 1}: ${tech.firstName} ${tech.lastName}`);
        console.log(`  Status: ${tech.status} (type: ${typeof tech.status})`);
        console.log(`  Skills:`, tech.skills);
        console.log(`  Location:`, tech.location);
        console.log(`  Location.coordinates:`, tech.location?.coordinates);
        console.log(`  Coordinates exists?`, tech.location?.coordinates !== undefined);
        console.log(`  Coordinates is null?`, tech.location?.coordinates === null);
        console.log(`  Coordinates is array?`, Array.isArray(tech.location?.coordinates));
        console.log(`  Coordinates length:`, tech.location?.coordinates?.length);
      });

    } else {
      console.log('✅ FOUND TECHNICIANS:');
      technicians.forEach(tech => {
        console.log(`  - ${tech.firstName} ${tech.lastName} (${tech.email})`);
      });
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
debugQuery();
