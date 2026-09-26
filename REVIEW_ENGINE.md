# CUSTO Review Engine Documentation

## 1. Overview
The **CUSTO Review Engine** (`services/ReviewEngine.ts`) is a parameterized, deterministic review-generation service layer. It transforms customer-selected experience attributes and factual business context into natural, varied, and polished customer reviews without fabricating experiences or inventing clinical/medical claims.

---

## 2. Core Operating Principles

1. **No Hallucination Rule**:
   The engine only synthesizes factual business information (name, city, category, service) and attributes explicitly selected by the customer. It never fabricates medical outcomes, staff behavior, or unverified claims.

2. **Sentence Combinator & Variety**:
   Structures reviews dynamically by selecting randomized openings, tone-specific statements, attribute sentence banks, brand mentions, and closings.

3. **SEO Integration**:
   Incorporates natural, location-relevant keywords (e.g., "trusted healthcare in Wardha") without artificial keyword stuffing.

---

## 3. API Signature

```typescript
import { ReviewEngine } from '@/services/ReviewEngine';

const result = ReviewEngine.generate({
  business: {
    name: 'AAS Hospital & Pathology',
    city: 'Wardha',
    category: 'healthcare',
    googleReviewUrl: 'https://g.page/r/.../review',
  },
  serviceName: 'Laparoscopic Surgery',
  selectedAttributes: ['doctor', 'surgeon', 'clean'],
  tone: 'patient', // 'patient' | 'grateful' | 'professional' | 'family'
});

console.log(result.reviewText);
```
