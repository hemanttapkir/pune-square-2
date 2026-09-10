import { supabase } from '@/lib/supabase';

export interface InquiryInput {
  fullName: string;
  phone: string;
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
export async function submitInquiry(input: InquiryInput) {
  const { error } = await supabase.from('inquiries').insert([
    {
      full_name: input.fullName,
      phone: input.phone,
      email: input.email || null,
      message: input.message || null,
      property_id: input.propertyId || null,
    },
  ]);

  if (error) throw error;
}
