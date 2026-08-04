import { supabase } from '@/lib/supabase';

export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Studio',
  'Penthouse',
  'Plot',
  'Commercial',
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  locality?: string;
  city?: string;
  location?: string;
  price?: string;
  rera?: string;
  propertyType?: string;
  amenities?: string[];
  unit_pricing?: Array<{ unit_type: string; carpet_area: string; price: string }>;
  imagesUrl?: string[];
  featured_image?: string;
  status?: string;
}

// Fetch all active projects (for homepage/listings)
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((property) => ({
    id: property.id,
    title: property.title,
    slug: property.slug,
    description: property.description,
    locality: property.locality,
    city: property.city,
    location: `${property.locality || ''}${property.city ? `, ${property.city}` : ''}`,
    rera: property.rera_id,
    amenities: property.amenities,
    unit_pricing: property.unit_pricing,
    imagesUrl: property.featured_image ? [property.featured_image] : [],
    featured_image: property.featured_image,
  }));
}

// Fetch single project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !property) return null;

  const { data: images } = await supabase
    .from('property_images')
    .select('image_url')
    .eq('property_id', property.id);

  const imagesUrl = images && images.length > 0 
    ? images.map((img) => img.image_url)
    : property.featured_image ? [property.featured_image] : [];

  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    description: property.description,
    locality: property.locality,
    city: property.city,
    location: `${property.locality || ''}${property.city ? `, ${property.city}` : ''}`,
    rera: property.rera_id,
    amenities: property.amenities,
    unit_pricing: property.unit_pricing,
    imagesUrl,
  };
}
// Add new project to Supabase
export async function createProject(data: {
  title: string;
  locality: string;
  price: string;
  rera: boolean;
  propertyType: PropertyType;
  description?: string;
  imagesUrl: string[];
}) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const { data: property, error } = await supabase
    .from('properties')
    .insert({
      title: data.title,
      slug,
      locality: data.locality,
      description: data.description,
      status: 'active',
    })
    .select()
    .single();

  if (error || !property) {
    console.error('Error inserting property:', error);
    throw error;
  }

  // Insert images into property_images table if present
  if (data.imagesUrl.length > 0) {
    const imageRecords = data.imagesUrl.map((url) => ({
      property_id: property.id,
      image_url: url,
    }));

    await supabase.from('property_images').insert(imageRecords);
  }

  return property;
}