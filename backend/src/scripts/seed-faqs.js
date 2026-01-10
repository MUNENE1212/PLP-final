require('dotenv').config();
const mongoose = require('mongoose');
const FAQ = require('../models/FAQ');

const faqs = [
  {
    question: 'How does Dumu Waks work?',
    answer: 'Dumu Waks connects you with verified technicians in 3 simple steps:\n\n1️⃣ **Describe Your Problem** - Tell us what you need fixed and where you are.\n\n2️⃣ **Get Matched** - Our AI matches you with the best technician in under 60 seconds.\n\n3️⃣ **Book & Pay** - Schedule your service and pay securely via M-Pesa. Money is held in escrow until the job is complete to your satisfaction.\n\nAll technicians are ID-verified and skills-assessed!',
    category: 'general',
    keywords: ['how', 'works', 'process', 'get started', 'begin', 'start'],
    order: 1
  },
  {
    question: 'What services do you offer?',
    answer: 'We offer a wide range of professional maintenance and repair services:\n\n🔧 **Plumbing** - Leaks, installations, repairs\n⚡ **Electrical** - Wiring, fixtures, repairs\n🪵 **Carpentry** - Furniture, cabinets, repairs\n🎨 **Painting** - Interior, exterior, decorative\n🧹 **Cleaning** - Home, office, deep cleaning\n🔌 **Appliance Repair** - Fridges, washers, ovens\n\nAll technicians are verified and reviewed by real customers.',
    category: 'services',
    keywords: ['services', 'offer', 'provide', 'available', 'types'],
    order: 1
  },
  {
    question: 'How do I pay for services?',
    answer: 'We use **M-Pesa** for all payments - it\'s secure, fast, and convenient!\n\n💰 **How It Works:**\n• You receive an exact quote before booking\n• Pay via M-Pesa when you confirm the booking\n• Money is held safely in escrow\n• Payment is released to technician ONLY after you approve the completed work\n\nThis protects both you and the technician. No hidden fees, no surprises!',
    category: 'payment',
    keywords: ['payment', 'pay', 'mpesa', 'money', 'cost', 'price'],
    order: 1
  },
  {
    question: 'Are your technicians verified?',
    answer: '**Yes! All technicians are thoroughly verified:**\n\n✅ National ID checked\n✅ Skills assessed\n✅ References contacted\n✅ Background verification\n✅ Real customer reviews only\n\nWe take safety seriously. You can trust that anyone we send to your home or business is professional and trustworthy.',
    category: 'technicians',
    keywords: ['verified', 'safe', 'trust', 'background', 'check', 'technician'],
    order: 1
  },
  {
    question: 'What areas do you cover?',
    answer: 'We currently serve **all major cities in Kenya**:\n\n📍 Nairobi\n📍 Mombasa\n📍 Kisumu\n📍 Nakuru\n📍 Eldoret\n📍 And surrounding areas\n\nIf you\'re unsure whether we cover your location, just ask DumuBot and we\'ll check for you!',
    category: 'general',
    keywords: ['location', 'area', 'cover', 'where', 'cities', 'regions'],
    order: 2
  },
  {
    question: 'How do I book a technician?',
    answer: 'Booking is easy!\n\n**Option 1: Use DumuBot** 🤖\nJust tell me what you need and I\'ll match you with the best technician.\n\n**Option 2: Browse Technicians**\n1. Go to "Find Technicians"\n2. Filter by service type and location\n3. View profiles, ratings, and reviews\n4. Select your preferred technician\n5. Choose a date and time\n6. Pay via M-Pesa\n\nYou\'ll receive confirmation instantly!',
    category: 'booking',
    keywords: ['book', 'booking', 'schedule', 'appointment', 'how to'],
    order: 1
  },
  {
    question: 'Can I cancel or reschedule my booking?',
    answer: 'Yes! You can cancel or reschedule:\n\n**Free Cancellation:** Up to 2 hours before the scheduled time\n\n**Rescheduling:** Any time before the appointment\n\nTo cancel or reschedule:\n1. Go to "My Bookings"\n2. Select the booking\n3. Click "Reschedule" or "Cancel"\n4. Choose a new time (if rescheduling)\n\nIf you need to cancel within 2 hours, please contact support and we\'ll try to help.',
    category: 'booking',
    keywords: ['cancel', 'reschedule', 'change', 'modify'],
    order: 2
  },
  {
    question: 'What if I\'m not satisfied with the work?',
    answer: 'Your satisfaction is our priority! Here\'s our resolution process:\n\n1️⃣ **Communicate** - First, talk to the technician and explain the issue\n\n2️⃣ **Request Fix** - Ask them to fix the problem at no extra cost\n\n3️⃣ **Escalate** - If not resolved, contact our support team\n\n4️⃣ **Dispute Resolution** - We\'ll investigate and mediate\n\n5️⃣ **Money Back** - If the work is truly substandard, we\'ll refund your payment from escrow\n\nWe hold payment in escrow specifically to protect you in these situations.',
    category: 'support',
    keywords: ['unsatisfied', 'problem', 'issue', 'dispute', 'refund', 'quality'],
    order: 1
  },
  {
    question: 'How are technicians rated?',
    answer: 'We use a transparent 5-star rating system:\n\n⭐⭐⭐⭐⭐ Excellent\n⭐⭐⭐⭐ Good\n⭐⭐⭐ Average\n⭐⭐ Poor\n⭐ Terrible\n\n**Who can rate?** Only verified customers who actually booked and paid for the service can leave reviews.\n\n**What we track:**\n• Quality of work\n• Timeliness\n• Communication\n• Professionalism\n• Cleanliness\n\nThis ensures all reviews are genuine and helpful for other customers.',
    category: 'technicians',
    keywords: ['rating', 'reviews', 'stars', 'rated', 'score'],
    order: 2
  },
  {
    question: 'How do I become a technician on Dumu Waks?',
    answer: 'We\'d love to have you join our team! Here\'s how:\n\n**Requirements:**\n✓ Valid National ID\n✓ Verifiable skills & experience\n✓ Good reputation\n✓ Professional tools\n✓ M-Pesa account for payments\n\n**Benefits:**\n• Get matched with customers automatically\n• Receive payments securely via M-Pesa\n• Build your reputation with reviews\n• Flexible schedule - work when you want\n• Earn great income!\n\n**To Apply:**\nRegister as a technician at: /register?role=technician\n\nOur team will review your application and verify your credentials within 48 hours.',
    category: 'account',
    keywords: ['become', 'join', 'technician', 'register', 'sign up', 'apply'],
    order: 1
  },
  {
    question: 'What are your prices?',
    answer: 'Our pricing is transparent and fair:\n\n**How it works:**\n• Technicians set their own rates\n• You see the EXACT price before booking\n• No hidden fees or surprises\n• Pay via M-Pesa when you book\n\n**Typical price ranges:**\n• Plumbing: KES 500 - 5,000\n• Electrical: KES 500 - 5,000\n• Carpentry: KES 1,000 - 10,000\n• Painting: KES 2,000 - 15,000\n• Cleaning: KES 500 - 3,000\n\nThe exact price depends on the specific job, materials needed, and time required. You\'ll always receive a quote before you commit to booking!',
    category: 'pricing',
    keywords: ['price', 'cost', 'expensive', 'cheap', 'rates', 'charges'],
    order: 1
  },
  {
    question: 'Is my payment secure?',
    answer: '**Absolutely! We use escrow protection:**\n\n🔒 **How Escrow Works:**\n1. You pay via M-Pesa when booking\n2. Money is held in a secure escrow account\n3. Technician completes the work\n4. You review and approve the work\n5. Payment is released to technician\n\n✅ If you\'re not satisfied, you can dispute the release\n✅ If there\'s an issue, we\'ll refund you\n✅ Technicians only get paid when you\'re happy\n\nThis system protects both you and the technician. No scams, no ghosting!',
    category: 'payment',
    keywords: ['secure', 'safe', 'protection', 'escrow', 'guarantee'],
    order: 2
  },
  {
    question: 'How do I contact customer support?',
    answer: 'We\'re here to help! Here\'s how to reach us:\n\n📧 **Email:** support@dumuwaks.com\n\n📱 **Phone:** +254 XXX XXX XXX\n\n💬 **Live Chat:** Use the DumuBot chat widget\n\n📝 **Contact Form:** Available on our website\n\n**Response Times:**\n• Live Chat: Instant\n• Email: Within 1 hour during business hours\n• Phone: Mon-Sat, 8am-6pm EAT\n\nFor urgent issues with ongoing bookings, please call us directly.',
    category: 'support',
    keywords: ['contact', 'support', 'help', 'phone', 'email', 'reach'],
    order: 2
  },
  {
    question: 'Do you offer emergency services?',
    answer: 'Yes! We understand some issues can\'t wait.\n\n**Emergency Services:**\n• Burst pipes\n• Electrical emergencies\n• Gas leaks\n• Lockouts\n• Other urgent repairs\n\n**How to Request Emergency Service:**\n1. Use DumuBot and mention it\'s urgent\n2. Or call us directly at +254 XXX XXX XXX\n3. We\'ll prioritize your request\n\n**Note:** Emergency services may have a higher fee. You\'ll always see the price before booking.',
    category: 'services',
    keywords: ['emergency', 'urgent', 'asap', 'immediate', 'emergency services'],
    order: 2
  },
  {
    question: 'How long does a service take?',
    answer: 'Service times vary depending on the job type and complexity:\n\n**Typical Timeframes:**\n• Minor repairs: 30 mins - 2 hours\n• Standard jobs: 2 - 4 hours\n• Major projects: 1 - 3 days\n\nThe technician will provide an estimated duration when you book. You\'ll see this estimate before you confirm the booking.\n\nIf a job takes longer than expected, the technician will communicate with you before proceeding.',
    category: 'services',
    keywords: ['time', 'long', 'duration', 'how long', 'hours', 'days'],
    order: 3
  }
];

async function seedFAQs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the entire FAQ collection to remove all indexes
    await FAQ.collection.drop();
    console.log('🗑️  Dropped FAQ collection');

    // Insert new FAQs (indexes will be recreated automatically)
    const insertedFAQs = await FAQ.insertMany(faqs);
    console.log(`✅ Inserted ${insertedFAQs.length} FAQs`);

    console.log('\n📚 FAQs successfully seeded!');
    process.exit(0);
  } catch (error) {
    if (error.code === 26) {
      // Namespace not found - collection doesn't exist yet
      console.log('ℹ️  Collection does not exist yet, creating it...');
      const insertedFAQs = await FAQ.insertMany(faqs);
      console.log(`✅ Inserted ${insertedFAQs.length} FAQs`);
      console.log('\n📚 FAQs successfully seeded!');
      process.exit(0);
    } else {
      console.error('❌ Error seeding FAQs:', error);
      process.exit(1);
    }
  }
}

seedFAQs();
