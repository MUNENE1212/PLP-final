require('dotenv').config();
const PricingConfig = require('../models/PricingConfig');
const { connectDB } = require('../config/db');

const verifyPricing = async () => {
  try {
    await connectDB();

    console.log('🔍 Verifying pricing configuration in Atlas...\n');

    const config = await PricingConfig.findOne({ isActive: true });

    if (!config) {
      console.log('❌ No active pricing configuration found!');
      process.exit(1);
    }

    console.log('✅ Active pricing configuration found!');
    console.log(`   ID: ${config._id}`);
    console.log(`   Name: ${config.name}`);
    console.log(`   Version: ${config.version}`);
    console.log(`   Service Prices: ${config.servicePrices.length} services`);
    console.log(`   Created: ${config.createdAt}`);

    console.log('\n📊 Service Categories:');
    const categories = {};
    config.servicePrices.forEach(service => {
      if (!categories[service.serviceCategory]) {
        categories[service.serviceCategory] = 0;
      }
      categories[service.serviceCategory]++;
    });

    Object.keys(categories).forEach(category => {
      console.log(`   ${category}: ${categories[category]} services`);
    });

    console.log('\n✅ Verification complete! Pricing model is ready for deployment.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying pricing:', error.message);
    process.exit(1);
  }
};

verifyPricing();
