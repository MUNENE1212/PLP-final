/**
 * Rollback Script: Revert profilePicture migration if needed
 *
 * IMPORTANT: This script requires a backup of the users collection
 * It will restore profilePicture values from a backup file
 *
 * Run with:
 *   node scripts/rollback-profile-pictures.js backup.json
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function rollbackProfilePictures() {
  try {
    const backupFile = process.argv[2];

    if (!backupFile) {
      console.error('❌ Error: Please provide backup file path');
      console.log('Usage: node scripts/rollback-profile-pictures.js <backup-file.json>');
      process.exit(1);
    }

    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Error: Backup file not found: ${backupFile}`);
      process.exit(1);
    }

    // Read backup
    console.log(`Reading backup from: ${backupFile}`);
    const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    console.log(`✅ Found ${backupData.length} users in backup\n`);

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ementech');
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;

    for (let i = 0; i < backupData.length; i++) {
      const backup = backupData[i];
      try {
        const result = await usersCollection.updateOne(
          { _id: new mongoose.Types.ObjectId(backup._id) },
          { $set: { profilePicture: backup.profilePicture } }
        );

        if (result.matchedCount === 0) {
          console.log(`[${i + 1}/${backupData.length}] ⚠️  User not found: ${backup._id}`);
          notFoundCount++;
        } else {
          console.log(`[${i + 1}/${backupData.length}] ✅ Restored user: ${backup.email || backup._id}`);
          successCount++;
        }
      } catch (error) {
        console.error(`[${i + 1}/${backupData.length}] ❌ Failed to restore user ${backup._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n========================================');
    console.log('Rollback Complete!');
    console.log(`✅ Successfully restored: ${successCount} users`);
    if (notFoundCount > 0) {
      console.log(`⚠️  Users not found: ${notFoundCount}`);
    }
    if (errorCount > 0) {
      console.log(`❌ Failed to restore: ${errorCount} users`);
    }
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('========================================');
console.log('Profile Picture Rollback Script');
console.log('========================================\n');

rollbackProfilePictures();
