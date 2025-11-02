/**
 * Migration Script: Convert profilePicture from Object to String
 *
 * This script migrates existing users' profilePicture field from the old format:
 * { url: "...", publicId: "..." }
 *
 * To the new format:
 * "https://..."
 *
 * Run with:
 *   DRY_RUN=true node scripts/migrate-profile-pictures.js  (preview changes)
 *   node scripts/migrate-profile-pictures.js               (execute migration)
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Dry run mode - set DRY_RUN=true to preview without making changes
const DRY_RUN = process.env.DRY_RUN === 'true';

async function migrateProfilePictures() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ementech');
    console.log('✅ Connected to MongoDB');

    if (DRY_RUN) {
      console.log('\n⚠️  DRY RUN MODE - No changes will be made\n');
    }

    // Get the User collection directly (bypass model validation)
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users with profilePicture as an object
    console.log('\nSearching for users with old profilePicture format...');
    const usersToMigrate = await usersCollection.find({
      'profilePicture.url': { $exists: true }
    }).toArray();

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration!');
      await mongoose.disconnect();
      return;
    }

    // Migrate each user
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < usersToMigrate.length; i++) {
      const user = usersToMigrate[i];
      try {
        const oldProfilePicture = user.profilePicture;
        let newProfilePicture = oldProfilePicture.url || null;

        // Replace broken Cloudinary URL with null
        if (newProfilePicture === 'https://res.cloudinary.com/default-avatar.png') {
          newProfilePicture = null;
        }

        if (DRY_RUN) {
          console.log(`[${i + 1}/${usersToMigrate.length}] Would migrate user: ${user.email || user._id}`);
          console.log(`  Old: ${JSON.stringify(oldProfilePicture)}`);
          console.log(`  New: ${newProfilePicture || 'null'}\n`);
          successCount++;
        } else {
          await usersCollection.updateOne(
            { _id: user._id },
            {
              $set: {
                profilePicture: newProfilePicture
              }
            }
          );

          console.log(`[${i + 1}/${usersToMigrate.length}] ✅ Migrated user: ${user.email || user._id}`);
          successCount++;
        }
      } catch (error) {
        console.error(`[${i + 1}/${usersToMigrate.length}] ❌ Failed to migrate user ${user._id}:`, error.message);
        errors.push({ userId: user._id, email: user.email, error: error.message });
        errorCount++;
      }
    }

    console.log('\n========================================');
    if (DRY_RUN) {
      console.log('DRY RUN Complete - No changes were made');
    } else {
      console.log('Migration Complete!');
    }
    console.log(`✅ Successfully ${DRY_RUN ? 'would migrate' : 'migrated'}: ${successCount} users`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} users`);
      console.log('\nErrors:');
      errors.forEach(err => {
        console.log(`  - ${err.email || err.userId}: ${err.error}`);
      });
    }
    console.log('========================================\n');

    if (DRY_RUN) {
      console.log('💡 To execute the migration, run without DRY_RUN flag:');
      console.log('   node scripts/migrate-profile-pictures.js\n');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run migration
console.log('========================================');
console.log('Profile Picture Migration Script');
console.log('========================================\n');

migrateProfilePictures();
