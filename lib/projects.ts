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
  unit_type: string;
  carpet_area: string;
  price: string;
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
  rera?: string;
  propertyType?: PropertyType;
  amenities?: string[];
  unit_pricing?: UnitPricing[];
  imagesUrl?: string[];
  featured_image?: string;
  status?: string;
  possessionDate?: string;
  constructionStatus?: 'under_construction' | 'ready_to_move' | 'new_launch' | string;
  createdAt?: string;
}

function mapProperty(property: any, imagesUrl: string[]): Project {
  const { label: startingPrice, lakh: priceLakh } = getStartingPrice(property.unit_pricing);
  return {
    id: property.id,
    title: property.title,
    slug: property.slug,
    description: property.description,
    locality: property.locality,
    city: property.city,
    location: `${property.locality || ''}${property.city ? `, ${property.city}` : ''}`,
    address: property.address,
    rera: property.rera_id,
    propertyType: property.property_type,
    amenities: property.amenities || [],
    unit_pricing: property.unit_pricing || [],
    imagesUrl,
    featured_image: property.featured_image,
    status: property.status,
    possessionDate: property.possession_date,
    constructionStatus: property.construction_status,
    createdAt: property.created_at,
    price: startingPrice ? `${startingPrice}` : undefined,
    priceRange: getPriceRange(property.unit_pricing),
    priceLakh,
  };
}

// Fetch all active projects (for homepage/listings)
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((property) =>
    mapProperty(property, property.featured_image ? [property.featured_image] : [])
  );
}

// Fetch single project by slug, including its full image gallery
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

// Fetch a handful of other active projects — used for the "similar projects" strip
// on a project detail page. Prefers same-city matches, then backfills with anything else.
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
