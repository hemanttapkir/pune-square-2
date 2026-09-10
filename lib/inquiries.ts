import { supabase } from '@/lib/supabase';

export interface InquiryInput {
  fullName: string;
  phone: string;
  project_id?: string | number;
  project_title?: string;
  email?: string;
  message?: string;
  /** The property this enquiry relates to. Leave undefined for a general / homepage lead. */
  propertyId?: string | null;
}

/**
 * Submits a lead to the `inquiries` table. Used both by the project detail page
 * (property-specific enquiries) and the homepage lead-capture form (general
 * enquiries, where property_id is left null and any extra context — budget,
 * preferred corridor, etc. — is folded into the message field).
 */
export async function submitInquiry(data: InquiryInput) {
  // 1. Save to Supabase Database
  const { data: lead, error } = await supabase.from('inquiries').insert([data]);
  if (error) throw error;

  // 2. Trigger Email Notification via Resend API
  try {
    await fetch('/api/send-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('Failed to trigger lead email:', err);
  }

  return lead;
}
