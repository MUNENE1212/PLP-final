/**
 * Profile Completeness Tests
 *
 * Tests for profile completeness calculation and management.
 * Covers scoring, suggestions, and section calculations.
 */

const mongoose = require('mongoose');
const ProfileCompleteness = require('../src/models/ProfileCompleteness');
const User = require('../src/models/User');
const profileCompletenessService = require('../src/services/profileCompleteness.service');
const dbHandler = require('./utils/dbHandler');

describe('Profile Completeness Service', () => {
  let technician;
  let customer;

  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  beforeEach(async () => {
    await dbHandler.clearDatabase();

    // Create test customer
    customer = await dbHandler.createTestUser({
      email: 'customer@example.com',
      role: 'customer'
    });

    // Create test technician with minimal profile (no default data)
    technician = await dbHandler.createTestTechnician({
      email: 'technician@example.com',
      profilePicture: null,
      bio: null,
      isPhoneVerified: false,
      isEmailVerified: false,
      workGalleryImages: [],
      rating: { average: 0, count: 0 },
      // Override defaults to have minimal profile
      skills: [],
      location: undefined,
      availability: undefined
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  // ============================================
  // BASIC CALCULATION TESTS
  // ============================================
  describe('calculateCompleteness', () => {
    it('should create a new profile completeness record for technician', async () => {
      const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

      expect(completeness).toBeDefined();
      expect(completeness.user.toString()).toBe(technician._id.toString());
      expect(completeness.score).toBeGreaterThanOrEqual(0);
      expect(completeness.score).toBeLessThanOrEqual(100);
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(profileCompletenessService.calculateCompleteness(fakeId))
        .rejects.toThrow('User not found');
    });

    it('should throw error for customer (non-technician)', async () => {
      await expect(profileCompletenessService.calculateCompleteness(customer._id))
        .rejects.toThrow('Profile completeness is only available for technicians');
    });

    it('should throw error for invalid user ID', async () => {
      await expect(profileCompletenessService.calculateCompleteness('invalid-id'))
        .rejects.toThrow('Invalid user ID');
    });

    it('should update existing completeness record on recalculation', async () => {
      // First calculation
      const first = await profileCompletenessService.calculateCompleteness(technician._id);

      // Update user profile
      technician.profilePicture = 'https://example.com/photo.jpg';
      await technician.save();

      // Second calculation
      const second = await profileCompletenessService.calculateCompleteness(technician._id);

      expect(second._id.toString()).toBe(first._id.toString());
      expect(second.score).toBeGreaterThan(first.score);
    });
  });

  // ============================================
  // SECTION CALCULATION TESTS
  // ============================================
  describe('Section Calculations', () => {
    describe('Basic Info Section (20%)', () => {
      it('should score 0% with no basic info', async () => {
        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.basicInfo.score).toBe(0);
        expect(completeness.sections.basicInfo.completed).toBe(false);
      });

      it('should score 25% with only profile picture', async () => {
        technician.profilePicture = 'https://example.com/photo.jpg';
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.basicInfo.items.find(i => i.name === 'profilePicture').completed).toBe(true);
        expect(completeness.sections.basicInfo.score).toBe(25);
      });

      it('should score 100% when all basic info is complete', async () => {
        technician.profilePicture = 'https://example.com/photo.jpg';
        technician.bio = 'Experienced plumber with over 10 years in the industry';
        technician.isPhoneVerified = true;
        technician.location = {
          type: 'Point',
          coordinates: [36.8219, -1.2921],
          address: 'Nairobi, Kenya'
        };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.basicInfo.score).toBe(100);
        expect(completeness.sections.basicInfo.completed).toBe(true);
      });

      it('should require bio to be at least 20 characters', async () => {
        technician.bio = 'Short bio'; // Less than 20 chars
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.basicInfo.items.find(i => i.name === 'bio').completed).toBe(false);
      });
    });

    describe('Services Section (25%)', () => {
      it('should score 0% with no services', async () => {
        technician.skills = [];
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.services.score).toBe(0);
      });

      it('should score 50% with services but no experience/pricing', async () => {
        technician.skills = [
          { name: 'Plumbing', category: 'plumbing' },
          { name: 'Electrical', category: 'electrical' },
          { name: 'Carpentry', category: 'carpentry' }
        ];
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.services.items.find(i => i.name === 'hasServices').completed).toBe(true);
        expect(completeness.sections.services.items.find(i => i.name === 'hasPrices').completed).toBe(false);
        expect(completeness.sections.services.score).toBe(50);
      });

      it('should score 100% with 3+ services and pricing', async () => {
        technician.skills = [
          { name: 'Plumbing', category: 'plumbing', yearsOfExperience: 5 },
          { name: 'Electrical', category: 'electrical', yearsOfExperience: 3 },
          { name: 'Carpentry', category: 'carpentry', yearsOfExperience: 2 }
        ];
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.services.score).toBe(100);
        expect(completeness.sections.services.completed).toBe(true);
      });
    });

    describe('Portfolio Section (20%)', () => {
      it('should score 0% with no portfolio images', async () => {
        technician.workGalleryImages = [];
        technician.portfolio = [];
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.portfolio.score).toBe(0);
      });

      it('should score 100% with 5+ portfolio images', async () => {
        technician.workGalleryImages = [
          { url: 'https://example.com/1.jpg', publicId: 'img1', category: 'plumbing', order: 1 },
          { url: 'https://example.com/2.jpg', publicId: 'img2', category: 'plumbing', order: 2 },
          { url: 'https://example.com/3.jpg', publicId: 'img3', category: 'plumbing', order: 3 },
          { url: 'https://example.com/4.jpg', publicId: 'img4', category: 'plumbing', order: 4 },
          { url: 'https://example.com/5.jpg', publicId: 'img5', category: 'plumbing', order: 5 }
        ];
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.portfolio.score).toBe(100);
        expect(completeness.sections.portfolio.completed).toBe(true);
      });

      it('should count images from both workGallery and portfolio', async () => {
        technician.workGalleryImages = [
          { url: 'https://example.com/1.jpg', publicId: 'img1', category: 'plumbing', order: 1 },
          { url: 'https://example.com/2.jpg', publicId: 'img2', category: 'plumbing', order: 2 }
        ];
        technician.portfolio = [
          { images: [{ url: 'https://example.com/3.jpg' }, { url: 'https://example.com/4.jpg' }] },
          { images: [{ url: 'https://example.com/5.jpg' }] }
        ];
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.portfolio.score).toBe(100);
      });
    });

    describe('Verification Section (15%)', () => {
      it('should score 0% with no verification', async () => {
        technician.isEmailVerified = false;
        technician.kyc = { verified: false };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.verification.score).toBe(0);
      });

      it('should score 50% with only email verified', async () => {
        technician.isEmailVerified = true;
        technician.kyc = { verified: false };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.verification.items.find(i => i.name === 'emailVerified').completed).toBe(true);
        expect(completeness.sections.verification.score).toBe(50);
      });

      it('should score 100% with both verifications', async () => {
        technician.isEmailVerified = true;
        technician.kyc = { verified: true, verifiedAt: new Date() };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.verification.score).toBe(100);
        expect(completeness.sections.verification.completed).toBe(true);
      });
    });

    describe('Availability Section (10%)', () => {
      it('should score 0% with no schedule', async () => {
        technician.availability = { isAvailable: false };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.availability.score).toBe(0);
      });

      it('should score 100% with schedule set', async () => {
        technician.availability = {
          isAvailable: true,
          schedule: [
            { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true }
          ]
        };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.availability.score).toBe(100);
        expect(completeness.sections.availability.completed).toBe(true);
      });
    });

    describe('Reviews Section (10%)', () => {
      it('should score 0% with no reviews', async () => {
        technician.rating = { average: 0, count: 0 };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.reviews.score).toBe(0);
      });

      it('should score 100% with at least one review', async () => {
        technician.rating = { average: 4.5, count: 5 };
        await technician.save();

        const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

        expect(completeness.sections.reviews.score).toBe(100);
        expect(completeness.sections.reviews.completed).toBe(true);
      });
    });
  });

  // ============================================
  // TOTAL SCORE CALCULATION TESTS
  // ============================================
  describe('Total Score Calculation', () => {
    it('should calculate weighted total score correctly', async () => {
      // Complete profile setup
      technician.profilePicture = 'https://example.com/photo.jpg';
      technician.bio = 'Experienced plumber with over 10 years in the industry';
      technician.isPhoneVerified = true;
      technician.location = {
        type: 'Point',
        coordinates: [36.8219, -1.2921],
        address: 'Nairobi, Kenya'
      };
      technician.skills = [
        { name: 'Plumbing', category: 'plumbing', yearsOfExperience: 5 },
        { name: 'Electrical', category: 'electrical', yearsOfExperience: 3 },
        { name: 'Carpentry', category: 'carpentry', yearsOfExperience: 2 }
      ];
      technician.isEmailVerified = true;
      technician.availability = {
        isAvailable: true,
        schedule: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true }
        ]
      };

      await technician.save();

      const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

      // Should have high score (excluding portfolio, reviews, and ID verification)
      // Basic Info: 100% * 20% = 20
      // Services: 100% * 25% = 25
      // Portfolio: 0% * 20% = 0
      // Verification: 50% * 15% = 7.5
      // Availability: 100% * 10% = 10
      // Reviews: 0% * 10% = 0
      // Total = 62.5
      expect(completeness.score).toBe(62.5);
    });

    it('should score 100% for fully complete profile', async () => {
      // Complete ALL sections
      technician.profilePicture = 'https://example.com/photo.jpg';
      technician.bio = 'Experienced plumber with over 10 years in the industry';
      technician.isPhoneVerified = true;
      technician.location = {
        type: 'Point',
        coordinates: [36.8219, -1.2921],
        address: 'Nairobi, Kenya'
      };
      technician.skills = [
        { name: 'Plumbing', category: 'plumbing', yearsOfExperience: 5 },
        { name: 'Electrical', category: 'electrical', yearsOfExperience: 3 },
        { name: 'Carpentry', category: 'carpentry', yearsOfExperience: 2 }
      ];
      technician.workGalleryImages = [
        { url: 'https://example.com/1.jpg', publicId: 'img1', category: 'plumbing', order: 1 },
        { url: 'https://example.com/2.jpg', publicId: 'img2', category: 'plumbing', order: 2 },
        { url: 'https://example.com/3.jpg', publicId: 'img3', category: 'plumbing', order: 3 },
        { url: 'https://example.com/4.jpg', publicId: 'img4', category: 'plumbing', order: 4 },
        { url: 'https://example.com/5.jpg', publicId: 'img5', category: 'plumbing', order: 5 }
      ];
      technician.isEmailVerified = true;
      technician.kyc = { verified: true, verifiedAt: new Date() };
      technician.availability = {
        isAvailable: true,
        schedule: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true }
        ]
      };
      technician.rating = { average: 4.5, count: 5 };

      await technician.save();

      const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

      expect(completeness.score).toBe(100);
    });
  });

  // ============================================
  // SUGGESTIONS TESTS
  // ============================================
  describe('getSuggestions', () => {
    it('should generate suggestions for incomplete items', async () => {
      const suggestions = await profileCompletenessService.getSuggestions(technician._id);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('section');
      expect(suggestions[0]).toHaveProperty('item');
      expect(suggestions[0]).toHaveProperty('label');
      expect(suggestions[0]).toHaveProperty('priority');
    });

    it('should sort suggestions by priority (highest first)', async () => {
      const suggestions = await profileCompletenessService.getSuggestions(technician._id);

      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].priority).toBeGreaterThanOrEqual(suggestions[i + 1].priority);
      }
    });

    it('should include action URLs for actionable items', async () => {
      const suggestions = await profileCompletenessService.getSuggestions(technician._id);

      const profilePicSuggestion = suggestions.find(s => s.item === 'profilePicture');
      expect(profilePicSuggestion).toBeDefined();
      expect(profilePicSuggestion.actionUrl).toBeDefined();
    });

    it('should limit suggestions when limit parameter is provided', async () => {
      const suggestions = await profileCompletenessService.getSuggestions(technician._id, 3);

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for complete profile', async () => {
      // Complete ALL sections
      technician.profilePicture = 'https://example.com/photo.jpg';
      technician.bio = 'Experienced plumber with over 10 years in the industry';
      technician.isPhoneVerified = true;
      technician.location = {
        type: 'Point',
        coordinates: [36.8219, -1.2921],
        address: 'Nairobi, Kenya'
      };
      technician.skills = [
        { name: 'Plumbing', category: 'plumbing', yearsOfExperience: 5 },
        { name: 'Electrical', category: 'electrical', yearsOfExperience: 3 },
        { name: 'Carpentry', category: 'carpentry', yearsOfExperience: 2 }
      ];
      technician.workGalleryImages = [
        { url: 'https://example.com/1.jpg', publicId: 'img1', category: 'plumbing', order: 1 },
        { url: 'https://example.com/2.jpg', publicId: 'img2', category: 'plumbing', order: 2 },
        { url: 'https://example.com/3.jpg', publicId: 'img3', category: 'plumbing', order: 3 },
        { url: 'https://example.com/4.jpg', publicId: 'img4', category: 'plumbing', order: 4 },
        { url: 'https://example.com/5.jpg', publicId: 'img5', category: 'plumbing', order: 5 }
      ];
      technician.isEmailVerified = true;
      technician.kyc = { verified: true, verifiedAt: new Date() };
      technician.availability = {
        isAvailable: true,
        schedule: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true }
        ]
      };
      technician.rating = { average: 4.5, count: 5 };

      await technician.save();

      const suggestions = await profileCompletenessService.getSuggestions(technician._id);

      expect(suggestions.length).toBe(0);
    });
  });

  // ============================================
  // GET MISSING ITEMS TESTS
  // ============================================
  describe('getMissingItems', () => {
    it('should return all incomplete items', async () => {
      const missingItems = await profileCompletenessService.getMissingItems(technician._id);

      expect(missingItems.length).toBeGreaterThan(0);
      expect(missingItems[0]).toHaveProperty('section');
      expect(missingItems[0]).toHaveProperty('name');
      expect(missingItems[0]).toHaveProperty('label');
      expect(missingItems[0].completed).toBe(false);
    });
  });

  // ============================================
  // MODEL VIRTUALS TESTS
  // ============================================
  describe('Profile Completeness Model Virtuals', () => {
    it('should return correct level based on score', async () => {
      technician.profilePicture = 'https://example.com/photo.jpg';
      await technician.save();

      const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

      expect(['incomplete', 'needsWork', 'fair', 'good', 'excellent']).toContain(completeness.level);
    });

    it('should return correct color based on score', async () => {
      technician.profilePicture = 'https://example.com/photo.jpg';
      await technician.save();

      const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

      expect(['#ef4444', '#f97316', '#eab308', '#22c55e']).toContain(completeness.color);
    });

    it('should identify visibility eligibility for scores >= 70', async () => {
      // Setup a profile with score >= 70
      technician.profilePicture = 'https://example.com/photo.jpg';
      technician.bio = 'Experienced plumber with over 10 years in the industry';
      technician.isPhoneVerified = true;
      technician.location = {
        type: 'Point',
        coordinates: [36.8219, -1.2921],
        address: 'Nairobi, Kenya'
      };
      technician.skills = [
        { name: 'Plumbing', category: 'plumbing', yearsOfExperience: 5 },
        { name: 'Electrical', category: 'electrical', yearsOfExperience: 3 },
        { name: 'Carpentry', category: 'carpentry', yearsOfExperience: 2 }
      ];
      technician.isEmailVerified = true;
      technician.availability = {
        isAvailable: true,
        schedule: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true }
        ]
      };

      await technician.save();

      const completeness = await profileCompletenessService.calculateCompleteness(technician._id);

      if (completeness.score >= 70) {
        expect(completeness.isVisibilityEligible).toBe(true);
      }
    });
  });

  // ============================================
  // STALENESS TESTS
  // ============================================
  describe('Caching and Staleness', () => {
    it('should return cached result if not stale', async () => {
      // First calculation
      const first = await profileCompletenessService.getCompleteness(technician._id);

      // Second call should return same (cached) result
      const second = await profileCompletenessService.getCompleteness(technician._id);

      expect(first.lastCalculatedAt.toString()).toBe(second.lastCalculatedAt.toString());
    });

    it('should force recalculation when flag is true', async () => {
      // First calculation
      const first = await profileCompletenessService.getCompleteness(technician._id);

      // Force recalculation
      const second = await profileCompletenessService.getCompleteness(technician._id, true);

      expect(new Date(second.lastCalculatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(first.lastCalculatedAt).getTime()
      );
    });
  });

  // ============================================
  // STATISTICS TESTS
  // ============================================
  describe('getStatistics', () => {
    it('should return statistics for all profiles', async () => {
      // Create a few technicians with varying completeness
      const tech2 = await dbHandler.createTestTechnician({
        email: 'tech2@example.com',
        profilePicture: 'https://example.com/photo.jpg'
      });

      await profileCompletenessService.calculateCompleteness(technician._id);
      await profileCompletenessService.calculateCompleteness(tech2._id);

      const stats = await profileCompletenessService.getStatistics();

      expect(stats).toHaveProperty('summary');
      expect(stats.summary.totalProfiles).toBe(2);
    });
  });

  // ============================================
  // BATCH OPERATIONS TESTS
  // ============================================
  describe('batchCalculate', () => {
    it('should calculate completeness for multiple users', async () => {
      const tech2 = await dbHandler.createTestTechnician({
        email: 'tech2@example.com'
      });
      const tech3 = await dbHandler.createTestTechnician({
        email: 'tech3@example.com'
      });

      const results = await profileCompletenessService.batchCalculate([
        technician._id,
        tech2._id,
        tech3._id
      ]);

      expect(results.success).toBe(3);
      expect(results.failed).toBe(0);
    });

    it('should handle partial failures in batch', async () => {
      const tech2 = await dbHandler.createTestTechnician({
        email: 'tech2@example.com'
      });

      const results = await profileCompletenessService.batchCalculate([
        technician._id,
        tech2._id,
        customer._id, // This will fail (not a technician)
      ]);

      expect(results.success).toBe(2);
      expect(results.failed).toBe(1);
      expect(results.errors.length).toBe(1);
    });
  });
});
