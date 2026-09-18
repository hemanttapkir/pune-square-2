// lib/inquiries.ts
import { supabase } from '@/lib/supabase';

// Matches the real `inquiries` table columns:
// id, property_id (uuid), full_name, phone, email, message, created_at
export interface InquiryInput {
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  project_id?: string | number | null; // mapped to property_id below
  project_title?: string;              // no dedicated column — folded into message
}

export async function submitInquiry(data: InquiryInput) {
  const fullName = data.fullName?.trim();
  const phone = data.phone?.trim();

  if (!fullName || !phone) {
    throw new Error('Name and phone are required.');
  }
  // Basic sanity check — adjust to match the phone formats you expect
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    throw new Error('Please enter a valid phone number.');
  }

  // There's no project_title column, so fold it into the message instead of
  // dropping it on the floor.
  let formattedMessage = data.message || '';
  if (data.project_title) {
    formattedMessage = `[Project: ${data.project_title}] ${formattedMessage}`.trim();
  }

  // property_id is a uuid column. If project.id isn't a valid UUID string,
  // Supabase will reject the insert with a type-mismatch error — send null
  // rather than a value that will fail the column's type check.
  const isUuid = (v: unknown): v is string =>
    typeof v === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  const propertyId = isUuid(data.project_id) ? data.project_id : null;

  const payload = {
    full_name: fullName,
    phone,
    email: data.email || null,
    property_id: propertyId,
    message: formattedMessage || null,
  };

  const { error } = await supabase.from('inquiries').insert([payload]);

  if (error) {
    console.error('SUPABASE_ERROR_DETAILS:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(error.message);
  }

  return true;
}