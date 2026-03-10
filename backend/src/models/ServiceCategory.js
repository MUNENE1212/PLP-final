const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * ServiceCategory Schema
 * Represents the 16 main service categories in the WORD BANK
 * Each category contains multiple services offered by technicians
 */
const ServiceCategorySchema = new Schema({
  // Category name (stored in UPPERCASE for WORD BANK display)
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 100
  },

  // Display slug for URL-friendly references
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Icon representation (emoji or image URL)
  icon: {
    type: String,
    default: null
  },

  // Detailed description of the category
  description: {
    type: String,
    required: [true, 'Category description is required'],
    maxlength: 500
  },

  // Sort order for display purposes (lower numbers appear first)
  sortOrder: {
    type: Number,
    default: 0,
    min: 0
  },

  // Active status (inactive categories won't appear in WORD BANK)
  isActive: {
    type: Boolean,
    default: true
  },

  // SEO and search metadata
  meta: {
    keywords: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    searchBoost: {
      type: Number,
      default: 1,
      min: 0.1,
      max: 10
    }
  },

  // Category image/banner
  image: {
    url: String,
    publicId: String,
    alt: String
  },

  // Color theme for UI (hex color)
  color: {
    type: String,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    default: '#333333'
  },

  // Soft delete
  deletedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ===== INDEXES =====
ServiceCategorySchema.index({ sortOrder: 1 });
ServiceCategorySchema.index({ isActive: 1 });

// Text search index
ServiceCategorySchema.index({
  name: 'text',
  description: 'text',
  'meta.keywords': 'text'
});

// ===== VIRTUAL FIELDS =====

// Virtual for services belonging to this category
ServiceCategorySchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

// Virtual for service count (to be populated with aggregation)
ServiceCategorySchema.virtual('serviceCount', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'category',
  count: true,
  match: { isActive: true, approvalStatus: 'approved' }
});

// Virtual for technician count offering services in this category
ServiceCategorySchema.virtual('technicianCount', {
  ref: 'TechnicianService',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// ===== MIDDLEWARE =====

// Generate slug from name before saving
ServiceCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// ===== STATIC METHODS =====

/**
 * Find all active categories sorted by sortOrder
 * @returns {Promise<Array>} List of active categories
 */
ServiceCategorySchema.statics.findActive = function() {
  return this.find({ isActive: true, deletedAt: null })
    .sort({ sortOrder: 1, name: 1 });
};

/**
 * Find category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Category document
 */
ServiceCategorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug: slug.toLowerCase(), isActive: true, deletedAt: null });
};

/**
 * Search categories by text
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching categories
 */
ServiceCategorySchema.statics.searchCategories = function(query) {
  return this.find(
    { $text: { $search: query }, isActive: true, deletedAt: null },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10);
};

/**
 * Get categories with service counts
 * @returns {Promise<Array>} Categories with aggregated service counts
 */
ServiceCategorySchema.statics.getCategoriesWithCounts = async function() {
  const Service = mongoose.model('Service');

  const categories = await this.findActive().lean();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const serviceCount = await Service.countDocuments({
        category: category._id,
        isActive: true,
        approvalStatus: 'approved'
      });

      return {
        ...category,
        serviceCount
      };
    })
  );

  return categoriesWithCounts;
};

// ===== INSTANCE METHODS =====

/**
 * Check if category can be deleted
 * @returns {Promise<boolean>} True if category can be deleted
 */
ServiceCategorySchema.methods.canBeDeleted = async function() {
  const Service = mongoose.model('Service');
  const serviceCount = await Service.countDocuments({ category: this._id });
  return serviceCount === 0;
};

/**
 * Soft delete the category
 * @returns {Promise<void>}
 */
ServiceCategorySchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  await this.save();
};

module.exports = mongoose.model('ServiceCategory', ServiceCategorySchema);
