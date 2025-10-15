require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { connectDB } = require('../config/db');

/**
 * Database Seeder Script
 * Seeds the database with sample data for testing
 */

const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Admin',
    email: 'admin@baitech.com',
    phoneNumber: '+254712345678',
    password: 'Admin@123',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
    location: {
      type: 'Point',
      coordinates: [36.8219, -1.2921],
      address: 'Nairobi, Kenya',
      city: 'Nairobi',
      county: 'Nairobi'
    }
  },
  {
    firstName: 'Mike',
    lastName: 'Technician',
    email: 'tech1@baitech.com',
    phoneNumber: '+254723456789',
    password: 'Tech@123',
    role: 'technician',
    isEmailVerified: true,
    isPhoneVerified: true,
    location: {
      type: 'Point',
      coordinates: [36.8319, -1.2821],
      address: 'Westlands, Nairobi',
      city: 'Nairobi',
      county: 'Nairobi'
    },
    skills: [
      {
        name: 'Plumbing',
        category: 'plumbing',
        yearsOfExperience: 5,
        verified: true
      },
      {
        name: 'Pipe Installation',
        category: 'plumbing',
        yearsOfExperience: 5,
        verified: true
      }
    ],
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isAvailable: true }
    ],
    hourlyRate: 1500,
    yearsOfExperience: 5,
    rating: {
      average: 4.7,
      count: 23
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Electrician',
    email: 'tech2@baitech.com',
    phoneNumber: '+254734567890',
    password: 'Tech@123',
    role: 'technician',
    isEmailVerified: true,
    isPhoneVerified: true,
    location: {
      type: 'Point',
      coordinates: [36.8419, -1.2721],
      address: 'Kilimani, Nairobi',
      city: 'Nairobi',
      county: 'Nairobi'
    },
    skills: [
      {
        name: 'Electrical Wiring',
        category: 'electrical',
        yearsOfExperience: 7,
        verified: true
      }
    ],
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isAvailable: true }
    ],
    hourlyRate: 2000,
    yearsOfExperience: 7,
    rating: {
      average: 4.9,
      count: 45
    }
  },
  {
    firstName: 'David',
    lastName: 'Customer',
    email: 'customer1@gmail.com',
    phoneNumber: '+254745678901',
    password: 'Customer@123',
    role: 'customer',
    isEmailVerified: true,
    isPhoneVerified: true,
    location: {
      type: 'Point',
      coordinates: [36.8519, -1.2621],
      address: 'Karen, Nairobi',
      city: 'Nairobi',
      county: 'Nairobi'
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Support',
    email: 'support@baitech.com',
    phoneNumber: '+254756789012',
    password: 'Support@123',
    role: 'support',
    isEmailVerified: true,
    isPhoneVerified: true,
    supportInfo: {
      employeeId: 'SUP001',
      department: 'general',
      specializations: ['bookings', 'accounts', 'technical'],
      languages: ['English', 'Swahili'],
      availability: {
        status: 'available',
        maxConcurrentTickets: 5
      }
    }
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    // Clear existing users
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Existing users cleared\n');

    // Create users
    console.log('👥 Creating sample users...');
    for (const userData of sampleUsers) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.email}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nSample Credentials:');
    console.log('==========================================');
    console.log('Admin:');
    console.log('  Email: admin@baitech.com');
    console.log('  Password: Admin@123\n');
    console.log('Technician 1:');
    console.log('  Email: tech1@baitech.com');
    console.log('  Password: Tech@123\n');
    console.log('Technician 2:');
    console.log('  Email: tech2@baitech.com');
    console.log('  Password: Tech@123\n');
    console.log('Customer:');
    console.log('  Email: customer1@gmail.com');
    console.log('  Password: Customer@123\n');
    console.log('Support:');
    console.log('  Email: support@baitech.com');
    console.log('  Password: Support@123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
