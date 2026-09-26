import { BusinessCategory } from '@/types';

export interface AISuggestionResult {
  tagline: string;
  description: string;
  highlights: { value: string; label: string }[];
  services: string[];
  keywords: string[];
}

export class AIHighlightSuggester {
  public static suggest(category: string, businessName: string = '', city: string = 'Wardha'): AISuggestionResult {
    const catLower = (category || '').toLowerCase();
    const cityText = city ? `in ${city}` : '';
    const nameText = businessName ? businessName : 'our business';

    if (catLower.includes('gym') || catLower.includes('fitness')) {
      return {
        tagline: `⭐ High-Energy Fitness, Modern Equipment & Certified Coaching ${cityText}`,
        description: `${nameText} is a premier fitness center equipped with imported weight training machinery, cardio zone, personal training, and customized diet plans to help you achieve your dream fitness goals.`,
        highlights: [
          { value: 'trainers', label: '🏋️ Certified Personal Trainers' },
          { value: 'equipment', label: '⚙️ Modern Imported Equipment' },
          { value: 'clean', label: '🧹 Clean & Sanitized Gym Floor' },
          { value: 'motivation', label: '🔥 Inspiring & Energetic Vibe' },
          { value: 'packages', label: '💳 Flexible & Affordable Memberships' },
          { value: 'facilities', label: '🚿 Steam Bath & Locker Facilities' },
        ],
        services: [
          'Personal Strength & Bodybuilding Training',
          'Cardio & Fat Loss Conditioning',
          'Functional & Crossfit Workouts',
          'Customized Diet & Nutrition Counseling',
          'Group Aerobics & Zumba Classes',
        ],
        keywords: [
          `Best Gym ${cityText}`,
          'Top Fitness Club',
          'Personal Trainer Gym',
          'Modern Gym Equipment',
          'Weight Loss & Bodybuilding',
        ],
      };
    }

    if (catLower.includes('sports') || catLower.includes('sports_academy')) {
      return {
        tagline: `⭐ Professional Sports Training, Expert Coaches & World-Class Turf ${cityText}`,
        description: `${nameText} provides structured athletic coaching in cricket, football, badminton, and swimming with certified national coaches and professional turf facilities for all age groups.`,
        highlights: [
          { value: 'coaches', label: '🏆 National & State Certified Coaches' },
          { value: 'facilities', label: '🏟️ Professional Astro Turf & Courts' },
          { value: 'youth', label: '👦 Youth & Adult Skill Development' },
          { value: 'tournaments', label: '🥇 Tournament & Match Preparation' },
          { value: 'safety', label: '🛡️ Safe & Disciplined Environment' },
        ],
        services: [
          'Junior & Senior Sports Coaching',
          'One-on-One Professional Training',
          'Weekend League Matches & Tournaments',
          'Physical Agility & Fitness Drills',
          'Summer Sports Training Camps',
        ],
        keywords: [
          `Best Sports Academy ${cityText}`,
          'Professional Sports Coaching',
          'Indoor Badminton & Turf',
          'Cricket Coaching Academy',
          'Youth Sports Club',
        ],
      };
    }

    if (catLower.includes('academic') || catLower.includes('coaching') || catLower.includes('class') || catLower.includes('tuition')) {
      return {
        tagline: `⭐ Top Academic Results, Expert Faculty & Concept-Driven Learning ${cityText}`,
        description: `${nameText} is a trusted educational institute specializing in school syllabus, competitive exam preparation (JEE/NEET), foundation courses, and personalized doubt-solving for top scores.`,
        highlights: [
          { value: 'faculty', label: '👨‍🏫 Highly Experienced Subject Faculty' },
          { value: 'attention', label: '🎯 Small Batches for Personal Attention' },
          { value: 'tests', label: '📝 Regular Mock Tests & Performance Reports' },
          { value: 'concepts', label: '💡 Concept-Oriented Easy Methods' },
          { value: 'doubts', label: '❓ Dedicated Daily Doubt-Solving' },
          { value: 'classrooms', label: '❄️ AC Classrooms & Study Library' },
        ],
        services: [
          '8th to 12th Board Exam Coaching',
          'JEE Main / NEET Entrance Preparation',
          'Personal Mentorship & Doubt Clearance',
          'Printed Study Material & Test Series',
          'Career Counseling & Parent Meetings',
        ],
        keywords: [
          `Best Coaching Classes ${cityText}`,
          'Top Academic Tuition Center',
          'JEE NEET Preparation Institute',
          'Best Science & Math Coaching',
          'Top Exam Results Institute',
        ],
      };
    }

    if (catLower.includes('restaurant') || catLower.includes('food') || catLower.includes('hospitality') || catLower.includes('cafe')) {
      return {
        tagline: `⭐ Authentic Flavors, Fresh Ingredients & Exceptional Dining ${cityText}`,
        description: `${nameText} offers delicious multi-cuisine delicacies, fresh mocktails, cozy ambience, and warm hospitality, perfect for family dinners, couples, and friends gatherings.`,
        highlights: [
          { value: 'taste', label: '🍲 Delicious & Fresh Authentic Taste' },
          { value: 'ambience', label: '✨ Cozy Ambience & Great Seating' },
          { value: 'service', label: '🤝 Fast & Courteous Staff Service' },
          { value: 'cleanliness', label: '🧹 Clean & Open Kitchen Hygiene' },
          { value: 'value', label: '💰 Generous Portion & Honest Value' },
          { value: 'family', label: '👨‍👩‍👧 Family Friendly & Celebration Vibe' },
        ],
        services: [
          'Dine-In Fine & Casual Dining',
          'Express Takeaway & Fast Home Delivery',
          'Private Birthday & Anniversary Parties',
          'Chef Special Signature Dishes',
        ],
        keywords: [
          `Best Restaurant ${cityText}`,
          'Top Cafe & Dining',
          'Delicious Food Quality',
          'Family Dining Place',
          'Best Multi-Cuisine Food',
        ],
      };
    }

    if (catLower.includes('dental') || catLower.includes('dentist')) {
      return {
        tagline: `⭐ Gentle Pain-Free Dentistry & Smile Design Excellence ${cityText}`,
        description: `${nameText} provides pain-free root canals, invisible aligners, dental implants, teeth whitening, and complete cosmetic smile transformations in a 100% sterilized environment.`,
        highlights: [
          { value: 'gentle', label: '🪥 Painless & Gentle Treatment' },
          { value: 'hygiene', label: '🧼 Sterilized & Clean Equipment' },
          { value: 'doctor', label: '🦷 Expert & Friendly Dental Surgeon' },
          { value: 'explain', label: '🗣️ Clear Treatment Explanation' },
          { value: 'affordable', label: '💰 Transparent & Fair Dental Fees' },
        ],
        services: [
          'Single-Sitting Root Canal Treatment (RCT)',
          'Teeth Scaling & Polishing',
          'Dental Implants & Porcelain Crowns',
          'Orthodontic Braces & Clear Aligners',
          'Cosmetic Smile Design & Whitening',
        ],
        keywords: [
          `Top Dentist ${cityText}`,
          'Painless Root Canal',
          'Best Dental Clinic',
          'Cosmetic Smile Design',
          'Dental Implant Specialist',
        ],
      };
    }

    if (catLower.includes('salon') || catLower.includes('spa') || catLower.includes('beauty')) {
      return {
        tagline: `⭐ Premium Hair, Skincare & Luxury Beauty Pampering ${cityText}`,
        description: `${nameText} is a luxury unisex salon and wellness spa offering trendy haircuts, hair coloring, glowing facial therapies, HD bridal makeup, and relaxing massages using international branded products.`,
        highlights: [
          { value: 'stylist', label: '✂️ Skilled & Trendy Hair Stylists' },
          { value: 'hospitality', label: '☕ Warm Welcome & Great Hospitality' },
          { value: 'products', label: '🧴 Premium Branded Products' },
          { value: 'hygiene', label: '🧼 Sanitized Tools & Towels' },
          { value: 'relaxing', label: '💆 Restorative & Peaceful Atmosphere' },
        ],
        services: [
          'Advanced Haircut, Styling & Keratin Treatment',
          'HD Bridal & Party Makeup Packages',
          'Skin Glow & Organic Facials',
          'Relaxing Body Spa & Therapy',
          'Manicure, Pedicure & Nail Art',
        ],
        keywords: [
          `Best Beauty Salon ${cityText}`,
          'Top Hair Stylists',
          'Bridal Makeup Specialist',
          'Relaxing Spa Experience',
          'Luxury Beauty Parlor',
        ],
      };
    }

    if (catLower.includes('retail') || catLower.includes('store') || catLower.includes('shop') || catLower.includes('boutique')) {
      return {
        tagline: `⭐ Premium Quality Products, Wide Collection & Best Prices ${cityText}`,
        description: `${nameText} is your one-stop shopping destination featuring high-quality merchandise, genuine branded products, attractive discounts, and friendly customer service.`,
        highlights: [
          { value: 'variety', label: '🛍️ Wide Product Range & Collection' },
          { value: 'pricing', label: '🏷️ Honest & Affordable Prices' },
          { value: 'helpfulness', label: '😊 Knowledgeable & Helpful Staff' },
          { value: 'authentic', label: '💯 100% Genuine Quality' },
          { value: 'fitting', label: '✨ Great Variety & Stock' },
        ],
        services: [
          'In-Store Retail Shopping & Fitting',
          'Home Delivery & Bulk Orders',
          'Gift Wrapping & Customized Selection',
        ],
        keywords: [
          `Best Shopping Store ${cityText}`,
          'Genuine Quality Products',
          'Great Discounted Prices',
          'Top Retail Outlet',
        ],
      };
    }

    if (catLower.includes('automobile') || catLower.includes('garage') || catLower.includes('car_wash')) {
      return {
        tagline: `⭐ Expert Auto Repair, Computerized Diagnostics & Foam Wash ${cityText}`,
        description: `${nameText} is a trusted multi-brand auto workshop providing computerized engine diagnostics, periodic maintenance, foam car washing, wheel alignment, and genuine spare parts.`,
        highlights: [
          { value: 'mechanic', label: '🔧 Certified & Experienced Mechanics' },
          { value: 'diagnostics', label: '💻 Computerized Engine Diagnostics' },
          { value: 'parts', label: '🛡️ 100% Genuine Spare Parts' },
          { value: 'transparency', label: '💰 Transparent Estimate & Honest Fees' },
          { value: 'wash', label: '✨ High-Pressure Foam Wash & Polish' },
        ],
        services: [
          'Periodic Vehicle Servicing & Inspection',
          'High-Pressure Foam Wash & Detailing',
          'Computerized Wheel Alignment & Balancing',
          'Car AC & Electrical Repair',
          'Engine Overhaul & Body Repair',
        ],
        keywords: [
          `Best Car Garage ${cityText}`,
          'Top Auto Workshop',
          'Foam Car Wash Center',
          'Wheel Alignment & Service',
          'Certified Mechanics Shop',
        ],
      };
    }

    if (catLower.includes('hotel') || catLower.includes('resort')) {
      return {
        tagline: `⭐ Luxury Stay, World-Class Amenities & Warm Hospitality ${cityText}`,
        description: `${nameText} features luxurious air-conditioned rooms, 24/7 room service, multi-cuisine dining, banquet facilities for events, and a tranquil atmosphere for family & business stays.`,
        highlights: [
          { value: 'rooms', label: '🛏️ Spacious & Ultra-Clean Rooms' },
          { value: 'hospitality', label: '🛎️ Courteous 24/7 Room Service' },
          { value: 'location', label: '📍 Prime & Convenient Location' },
          { value: 'food', label: '🍽️ Delicious In-House Dining' },
          { value: 'banquet', label: '🎉 Elegant Banquet & Event Hall' },
        ],
        services: [
          'Luxury Room & Suite Booking',
          'Banquet Hall for Weddings & Seminars',
          'Multi-Cuisine In-House Restaurant',
          'Airport Pick-up & Drop Service',
        ],
        keywords: [
          `Best Hotel ${cityText}`,
          'Top Luxury Resort',
          'Marriage Banquet Hall',
          'Comfortable Family Stay',
        ],
      };
    }

    if (catLower.includes('real_estate') || catLower.includes('property')) {
      return {
        tagline: `⭐ Verified Properties, Transparent Deals & Legal Guidance ${cityText}`,
        description: `${nameText} is a trusted property consultancy helping clients buy, sell, and rent residential plots, luxury flats, commercial spaces, and agricultural land with clear title verification.`,
        highlights: [
          { value: 'verified', label: '📜 100% Verified & Clear Title Deals' },
          { value: 'pricing', label: '🏷️ Fair Market Pricing & Zero Hidden Fees' },
          { value: 'paperwork', label: '✍️ Complete Legal & Registry Support' },
          { value: 'advisors', label: '🤝 Experienced Local Property Consultants' },
          { value: 'loan', label: '🏦 Easy Bank Home Loan Assistance' },
        ],
        services: [
          'Residential Plots & Apartment Sale/Purchase',
          'Commercial Office & Shop Leasing',
          'Property Legal Verification & Registration',
          'Home Loan & Financial Guidance',
        ],
        keywords: [
          `Best Real Estate Agency ${cityText}`,
          'Top Property Consultant',
          'Plots & Flats for Sale',
          'Commercial Rental Property',
        ],
      };
    }

    if (catLower.includes('professional') || catLower.includes('professional_services')) {
      return {
        tagline: `⭐ Expert Advisory, Timely Execution & Reliable Solutions ${cityText}`,
        description: `${nameText} offers expert professional consulting, financial advisory, legal compliance, technology solutions, and strategic planning to help businesses grow seamlessly.`,
        highlights: [
          { value: 'expert', label: '👔 Qualified & Senior Consultants' },
          { value: 'punctual', label: '⏱️ Timely & Accurate Execution' },
          { value: 'confidential', label: '🔒 Confidential & Secure Handling' },
          { value: 'guidance', label: '💡 Clear & Actionable Guidance' },
          { value: 'support', label: '📞 Dedicated Client Support' },
        ],
        services: [
          'Tax Filing & Financial Audit Consultation',
          'Legal Compliance & Contract Documentation',
          'IT & Software Development Solutions',
          'Architectural Planning & Structural Design',
        ],
        keywords: [
          `Best CA & Consultant ${cityText}`,
          'Top Professional Firm',
          'Reliable Business Advisory',
          'Legal & Compliance Services',
        ],
      };
    }

    if (catLower.includes('events') || catLower.includes('photography')) {
      return {
        tagline: `⭐ Creative Event Execution, Cinematic Photography & Magic ${cityText}`,
        description: `${nameText} specializes in full-service event management, wedding planning, theme decorations, and cinematic 4K photography to make your special celebrations unforgettable.`,
        highlights: [
          { value: 'photos', label: '📸 Cinematic 4K Photography & Drones' },
          { value: 'decor', label: '🌺 Creative Theme Stage & Decor' },
          { value: 'team', label: '🎬 Energetic & Punctual Crew' },
          { value: 'albums', label: '📖 Premium Photobook & Fast Delivery' },
          { value: 'custom', label: '💰 Customized Budget Packages' },
        ],
        services: [
          'Wedding & Pre-Wedding Cinematic Shoots',
          'Event Decoration & Stage Management',
          'Birthday & Party Celebration Setup',
          'Corporate Event Planning & Sound System',
        ],
        keywords: [
          `Best Photographer ${cityText}`,
          'Top Event Planner',
          'Pre-Wedding Shoot Studio',
          'Wedding Decorator & Events',
        ],
      };
    }

    if (catLower.includes('health') || catLower.includes('hospital') || catLower.includes('clinic') || catLower.includes('doctor')) {
      return {
        tagline: `⭐ Trusted Healthcare, Expert Doctors & Pathology ${cityText}`,
        description: `${nameText} is a multi-specialty healthcare facility offering advanced diagnostics, expert surgical care, 24/7 pharmacy, emergency services, and compassionate patient treatment.`,
        highlights: [
          { value: 'doctor', label: '🩺 Doctor Communication & Expertise' },
          { value: 'surgeon', label: '🩻 Surgical Skill & Precision' },
          { value: 'pathology', label: '🔬 Accurate Lab & Pathology Tests' },
          { value: 'staff', label: '👨‍⚕️ Caring & Supportive Staff' },
          { value: 'reports', label: '⚡ Fast & Timely Reports' },
          { value: 'clean', label: '🧹 Clean & Hygienic Premises' },
          { value: 'emergency', label: '🚑 Prompt Emergency Service' },
          { value: 'affordable', label: '💰 Transparent & Reasonable Fees' },
        ],
        services: [
          'General OPD Consultation',
          'Laparoscopic & General Surgery',
          'Pathology & Blood Diagnostics',
          'Endoscopy & Diagnostic Scans',
          '24/7 Pharmacy & Emergency Care',
        ],
        keywords: [
          `Best Hospital ${cityText}`,
          'Accurate Pathology Lab',
          'Experienced Surgeons',
          'Clean Patient Care',
          'Quick OPD Consultation',
        ],
      };
    }

    // Default / Services / Custom Fallback
    return {
      tagline: `⭐ Trusted & Dependable Service Provider ${cityText}`,
      description: `${nameText} is committed to delivering top-quality services, transparent communication, prompt execution, and customer satisfaction across all our solutions.`,
      highlights: [
        { value: 'professionalism', label: '👔 Highly Professional Team' },
        { value: 'quality', label: '⭐ Exceptional Execution Quality' },
        { value: 'punctuality', label: '⏱️ On-Time Delivery & Service' },
        { value: 'support', label: '📞 Prompt Customer Support' },
        { value: 'fair_price', label: '💰 Transparent & Fair Pricing' },
      ],
      services: [
        'Core Professional Service',
        'Customized Solutions & Support',
        'On-Demand Service Consultation',
      ],
      keywords: [
        `Best Service Provider ${cityText}`,
        'Prompt & Reliable Work',
        'Professional Customer Care',
      ],
    };
  }
}

