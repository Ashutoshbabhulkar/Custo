import { Business } from '@/types';

export interface ReviewEngineParams {
  business: {
    name: string;
    city?: string;
    category: string;
    googleReviewUrl: string;
  };
  serviceName?: string;
  selectedAttributes: string[];
  tone?: 'patient' | 'grateful' | 'professional' | 'family' | 'surgery' | 'diagnostic';
}

export interface GeneratedReviewResult {
  reviewText: string;
  wordCount: number;
  attributesUsed: string[];
}

const OPENINGS = [
  "I recently visited {{businessName}} and was very impressed with the overall experience.",
  "My experience at {{businessName}} exceeded my expectations.",
  "I am grateful for the care and attention I received during my visit to {{businessName}}.",
  "I would like to thank the entire team at {{businessName}} for the excellent service provided.",
  "Finding reliable service can be difficult, but my experience at {{businessName}} was reassuring.",
  "I visited {{businessName}} for {{serviceName}} and was pleasantly surprised by the high quality.",
  "From the moment I arrived at {{businessName}}, I felt that I was in good hands.",
  "The professionalism shown by the team at {{businessName}} stood out from the beginning.",
  "I had heard positive things about {{businessName}}, and my experience confirmed them.",
  "My family and I had a very positive experience during our recent visit to {{businessName}}.",
  "I was impressed by how smoothly everything was managed during my visit to {{businessName}}.",
  "This was my first visit to {{businessName}}, and it left a very positive impression.",
  "The service I received at {{businessName}} was both professional and compassionate.",
  "I wanted to take a moment to appreciate the excellent services provided at {{businessName}}.",
  "My visit to {{businessName}} was comfortable, efficient, and professionally managed."
];

const CLOSINGS = [
  "I would highly recommend {{businessName}} to anyone seeking quality services in {{city}}.",
  "Thank you to the entire team at {{businessName}} for their dedication and professionalism.",
  "I would confidently recommend {{businessName}} to friends and family.",
  "A trusted choice for quality service in {{city}}.",
  "I truly appreciate the efforts of everyone at {{businessName}} involved in my care.",
  "The experience at {{businessName}} exceeded my expectations in every way.",
  "Highly recommended for anyone looking for reliable service in {{city}}.",
  "Thank you for making my experience at {{businessName}} so positive.",
  "The quality of service at {{businessName}} deserves recognition.",
  "I am grateful for the service and support I received at {{businessName}}."
];

const BRAND_STATEMENTS = [
  "One thing that stood out was the professionalism of {{businessName}}.",
  "I particularly appreciated the dedication shown by {{businessName}}.",
  "{{businessName}} made the entire experience comfortable and reassuring.",
  "The commitment demonstrated by {{businessName}} was remarkable.",
  "The quality of service provided by {{businessName}} exceeded my expectations.",
  "The attention to detail shown by {{businessName}} was remarkable.",
  "{{businessName}} created a positive and reassuring experience."
];

const ATTRIBUTE_SENTENCE_POOLS: Record<string, string[]> = {
  // Healthcare attributes
  doctor: [
    "The doctors were highly knowledgeable and took time to explain every aspect of my treatment.",
    "I was impressed by the expertise and professionalism shown by the doctors.",
    "The medical team listened carefully to my concerns and provided clear guidance.",
    "The doctors demonstrated exceptional clinical knowledge throughout my visit.",
    "I felt confident in the treatment plan because everything was explained thoroughly."
  ],
  surgeon: [
    "The surgical team demonstrated exceptional skill and professionalism.",
    "I felt completely confident in the surgeon's expertise throughout the procedure.",
    "The surgeon explained the process clearly and addressed all my concerns.",
    "The surgical care provided was outstanding from start to finish.",
    "The surgeon's experience and confidence were evident throughout my treatment."
  ],
  pathology: [
    "The pathology services were accurate, efficient, and dependable.",
    "Reports were delivered on time without compromising quality.",
    "The laboratory team maintained high standards of accuracy and professionalism.",
    "I was impressed by the efficiency of the diagnostic services.",
    "The pathology department provided reliable and timely results."
  ],
  staff: [
    "The staff was courteous, helpful, and attentive throughout my visit.",
    "Every staff member treated me with kindness and respect.",
    "The support team ensured a comfortable and positive experience.",
    "The professionalism of the staff was evident from the moment I arrived.",
    "I was impressed by how organized and efficient the staff was."
  ],
  reports: [
    "Reports were delivered promptly and accurately.",
    "The turnaround time for reports was excellent.",
    "I received my reports much sooner than expected.",
    "The reporting process was smooth and efficient.",
    "Quick access to reports made the treatment process smoother."
  ],
  clean: [
    "The facility maintained exceptional cleanliness and hygiene standards.",
    "The environment was spotless and well organized.",
    "Cleanliness was evident throughout the premises.",
    "The premises were neat, comfortable, and hygienic.",
    "I was impressed by the attention given to cleanliness."
  ],
  emergency: [
    "Emergency services were prompt and efficiently managed.",
    "The emergency team responded quickly and professionally.",
    "Urgent care was provided without unnecessary delays.",
    "The responsiveness of the emergency department was impressive."
  ],
  affordable: [
    "The treatment was affordable without compromising quality.",
    "The business offers excellent value for the services provided.",
    "Services were delivered in a cost-effective and customer-friendly manner.",
    "I appreciated the transparent and reasonable pricing."
  ],
  friendly: [
    "The team was approachable and easy to talk to.",
    "The staff created a welcoming atmosphere.",
    "I appreciated the friendly and caring attitude of everyone involved.",
    "They took time to listen and understand my concerns."
  ],
  modern: [
    "The facilities were modern and well equipped.",
    "The business uses advanced infrastructure to support quality service.",
    "Modern facilities contributed to a smooth customer experience."
  ],
  diagnosis: [
    "The diagnostic process was thorough and accurate.",
    "I was impressed by the attention given to accuracy.",
    "The assessments were detailed and reliable."
  ],
  care: [
    "The customer-centered approach made me feel valued and respected.",
    "Compassionate care was evident throughout my experience.",
    "The focus on customer satisfaction was clear at every stage."
  ],

  // Hospitality & Services fallback pools
  taste: [
    "The taste and quality of the food were exceptional.",
    "Every dish was fresh, delicious, and beautifully presented.",
    "The food quality far exceeded my expectations."
  ],
  ambience: [
    "The ambience was warm, inviting, and extremely comfortable.",
    "The atmosphere added so much to the overall dining experience."
  ],
  service: [
    "The service was fast, polite, and attentive throughout.",
    "The staff ensured we had everything we needed without delay."
  ],
  professionalism: [
    "The team demonstrated a very high standard of professionalism.",
    "Every detail was handled with impressive skill and attention."
  ],
  punctuality: [
    "The service was completed right on time without delays.",
    "Punctuality and efficiency were evident throughout."
  ]
};

const TONE_SENTENCES: Record<string, string[]> = {
  patient: [
    "As a customer, I felt comfortable and well cared for throughout my visit.",
    "My experience from start to finish was smooth and reassuring.",
    "I felt confident in the service I received from the very beginning."
  ],
  grateful: [
    "I am genuinely thankful for the care and service I received.",
    "I would like to express my sincere appreciation for the support provided.",
    "The experience left me feeling thankful and reassured."
  ],
  professional: [
    "The quality of services provided reflected strong professional standards.",
    "The entire process demonstrated a commitment to excellence.",
    "The standards of service exceeded my expectations."
  ],
  family: [
    "My family and I were extremely satisfied with the experience.",
    "The support provided to my family was greatly appreciated.",
    "Our family felt comfortable and reassured throughout."
  ]
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export class ReviewEngine {
  public static generate(params: ReviewEngineParams): GeneratedReviewResult {
    const { business, serviceName, selectedAttributes, tone = 'patient' } = params;

    const cityText = business.city || 'our location';
    const serviceText = serviceName || 'service';

    // 1. Pick Opening
    const openingTemplate = pickRandom(OPENINGS);
    const opening = openingTemplate
      .replace(/{{businessName}}/g, business.name)
      .replace(/{{city}}/g, cityText)
      .replace(/{{serviceName}}/g, serviceText);

    // 2. Pick Tone Sentence
    const toneSentencePool = TONE_SENTENCES[tone] || TONE_SENTENCES['patient'];
    const toneSentence = pickRandom(toneSentencePool);

    // 3. Process Selected Attributes
    const usedAttributes: string[] = [];
    const bodySentences: string[] = [];
    const shuffledAttrs = shuffleArray(selectedAttributes);

    shuffledAttrs.forEach((attrKey) => {
      const pool = ATTRIBUTE_SENTENCE_POOLS[attrKey];
      if (pool && pool.length > 0) {
        const sentence = pickRandom(pool);
        bodySentences.push(
          sentence
            .replace(/{{businessName}}/g, business.name)
            .replace(/{{city}}/g, cityText)
        );
        usedAttributes.push(attrKey);
      }
    });

    // Fallback if no specific attributes matched
    if (bodySentences.length === 0) {
      bodySentences.push(`The quality of service provided at ${business.name} was consistently excellent.`);
    }

    // 4. Brand Mention
    const brandTemplate = pickRandom(BRAND_STATEMENTS);
    const brandLine = brandTemplate.replace(/{{businessName}}/g, business.name);

    // 5. Closing
    const closingTemplate = pickRandom(CLOSINGS);
    const closing = closingTemplate
      .replace(/{{businessName}}/g, business.name)
      .replace(/{{city}}/g, cityText);

    // 6. Assemble Full Review
    const fullReviewParts = [
      opening,
      toneSentence,
      ...bodySentences,
      brandLine,
      closing,
    ];

    const reviewText = fullReviewParts.join(' ');
    const wordCount = reviewText.trim().split(/\s+/).length;

    return {
      reviewText,
      wordCount,
      attributesUsed: usedAttributes,
    };
  }
}
