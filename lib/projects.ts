import { supabase } from '@/lib/supabase';
import { getStartingPrice, getPriceRange } from '@/lib/price';

export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Studio',
  'Penthouse',
  'Plot',
  'Commercial',
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface UnitPricing {
  unit_type?: string;
  carpet_area?: string;
  price?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  locality?: string;
  city?: string;
  location?: string;
  address?: string;
  price?: string;
  priceRange?: string | null;
  priceLakh?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  rera_id?: string | null;
  rera?: string;
  propertyType?: PropertyType | string;
  amenities?: string[];
  unit_pricing?: UnitPricing[];
  imagesUrl?: string[];
  featured_image?: string;
  status?: string;
  possessionDate?: string;
  constructionStatus?: 'under_construction' | 'ready_to_move' | 'new_launch' | string;
  createdAt?: string;
}

// Helper to format prices in Lac/Cr if min_price & max_price exist
function formatMinMaxPrice(min?: number | null, max?: number | null): string | null {
  if (!min && !max) return null;

  const toLacsOrCr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    return `₹${(val / 100000).toFixed(0)} Lac`;
  };

  if (min && max) return `${toLacsOrCr(min)} - ${toLacsOrCr(max)}`;
  return `Starting ${toLacsOrCr(min || max!)}`;
}

// Maps raw Supabase row into standard Project interface
function mapProperty(property: any, imagesUrl: string[] = []): Project {
  // Try calculating from unit_pricing first
  const { label: startingPrice, lakh: priceLakh } = getStartingPrice(property.unit_pricing);
  const calculatedRange = getPriceRange(property.unit_pricing);

  // Fallback to min_price / max_price if unit_pricing is empty
  const fallbackPrice = formatMinMaxPrice(property.min_price, property.max_price);

  const finalImages =
    imagesUrl.length > 0
      ? imagesUrl
      : property.featured_image
      ? [property.featured_image]
      : [];

  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    description: property.description,
    locality: property.locality,
    city: property.city,
    location: `${property.locality || ''}${property.city ? `, ${property.city}` : ''}`,
    address: property.address,
    min_price: property.min_price,
    max_price: property.max_price,
    rera_id: property.rera_id,
    rera: property.rera_id,
    propertyType: property.property_type,
    amenities: property.amenities || [],
    unit_pricing: property.unit_pricing || [],
    imagesUrl: finalImages,
    featured_image: property.featured_image,
    status: property.status,
    possessionDate: property.possession_date,
    constructionStatus: property.construction_status,
    createdAt: property.created_at,
    price: startingPrice || fallbackPrice || 'Price on Request',
    priceRange: calculatedRange || fallbackPrice,
    priceLakh: priceLakh || (property.min_price ? property.min_price / 100000 : null),
  };
}

// Fetch all active projects mapped to Project interface
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch error:', error.message);
    return [];
  }

  return (data || []).map((property) =>
    mapProperty(property, property.featured_image ? [property.featured_image] : [])
  );
}

// Fetch single project by slug with gallery images
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

  const imagesUrl =
    images && images.length > 0
      ? images.map((img) => img.image_url)
      : property.featured_image
      ? [property.featured_image]
      : [];

  return mapProperty(property, imagesUrl);
}

// Fetch similar projects in the same city
export async function getSimilarProjects(
  currentId: string,
  city?: string,
  limit = 3
): Promise<Project[]> {
  const all = await getProjects();
  const rest = all.filter((p) => p.id !== currentId);

  const sameCity = city ? rest.filter((p) => p.city === city) : [];
  const others = rest.filter((p) => !sameCity.includes(p));

  return [...sameCity, ...others].slice(0, limit);
}

// Add new project to Supabase
export async function createProject(data: {
  title: string;
  locality: string;
  price?: string;
  rera?: boolean;
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

  if (data.imagesUrl.length > 0) {
    const imageRecords = data.imagesUrl.map((url) => ({
      property_id: property.id,
      image_url: url,
    }));

    await supabase.from('property_images').insert(imageRecords);
  }

  return property;
}