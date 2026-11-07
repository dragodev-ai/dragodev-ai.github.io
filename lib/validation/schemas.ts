import { z } from 'zod';

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const u = new URL(val);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid http:// or https:// reference link.' }
  );

export const contactEnquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name (at least 2 characters).')
    .max(120, 'Name is too long.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(160),
  phoneWhatsapp: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone or WhatsApp number.')
    .max(32, 'Phone number is too long.'),
  interestedService: z
    .string()
    .trim()
    .min(2, 'Please select a service.')
    .max(120),
  projectBudget: z
    .string()
    .trim()
    .min(2, 'Please select a budget range or custom quote option.')
    .max(120),
  projectDescription: z
    .string()
    .trim()
    .min(15, 'Please share at least 15 characters describing your project.')
    .max(4000, 'Description must be under 4,000 characters.'),
  preferredMeetingDate: z.string().trim().max(40).optional().or(z.literal('')),
  preferredMeetingTime: z.string().trim().max(40).optional().or(z.literal('')),
  referenceLink: optionalUrlSchema,
  consent: z.literal(true, {
    errorMap: () => ({
      message: 'Please confirm consent so Dev Studio can respond to your enquiry.',
    }),
  }),
  // Anti-spam honeypot — must remain empty for human visitors
  website: z.string().max(200).optional().or(z.literal('')),
});

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;

export const bookingRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(120),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(160),
  phoneWhatsapp: z
    .string()
    .trim()
    .min(7, 'Please enter your phone or WhatsApp number.')
    .max(32),
  topic: z
    .string()
    .trim()
    .min(2, 'Please select or enter a discussion topic.')
    .max(140),
  preferredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid meeting date (YYYY-MM-DD).'),
  preferredTime: z
    .string()
    .trim()
    .min(2, 'Please choose a preferred IST time window.')
    .max(40),
  timezone: z.string().trim().default('Asia/Kolkata'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({
      message: 'Please confirm consent to schedule your discovery call.',
    }),
  }),
  website: z.string().max(200).optional().or(z.literal('')),
});

export type BookingRequestInput = z.infer<typeof bookingRequestSchema>;
