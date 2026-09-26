# CUSTO Security & Privacy Policy

## 1. Multi-Tenant Isolation
- All tenant-owned records are logically isolated using a mandatory `business_id` (or `tenant_id`).
- All administrative and dashboard queries enforce server-side `business_id` filtering. Client-supplied tenant IDs are never trusted.

## 2. Healthcare Privacy & Data Minimization
- **Strict PHI Minimization**: Custo does not request or record clinical diagnoses, medical history, lab values, or treatment records.
- Feedback forms focus strictly on service quality, waiting times, staff behavior, cleanliness, and facilities.

## 3. Input Validation & Abuse Prevention
- Schema validation via TypeScript interfaces and server-side checks.
- Text inputs sanitized against XSS attacks.
- Rate limiting on public feedback submission routes.
