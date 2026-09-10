/**
 * seed-projects.ts
 * -----------------
 * One-time script to load the 10 projects from
 * "West_Pune_New_Projects_Directory.xlsx" into Supabase, matching the
 * schema used by /admin/add-project (properties + property_images tables).
 *
 * HOW TO RUN
 *   1. Put this file anywhere in your Next.js project, e.g. scripts/seed-projects.ts
 *   2. npm install -D tsx   (if you don't already have a TS runner)
 *   3. npx tsx scripts/seed-projects.ts
 *
 * IMAGES
 *   The builder marketing photos for these projects are copyrighted and most
 *   are explicitly licensed "for representation only" — they should NOT be
 *   scraped and re-hosted on a third-party site like this one. Instead:
 *     - If you have rights-cleared photos (builder media kit, your own site
 *       visit, RERA brochure with permission), drop them in:
 *         ./project-images/<slug>/1.jpg, 2.jpg, ...
 *       and the script will upload them to the `property-images` bucket and
 *       set the first one as featured_image, exactly like the admin form does.
 *     - If a project's folder is empty/missing, the script leaves
 *       featured_image null and inserts no property_images rows — the
 *       project still goes live, just without a photo until you add one.
 *
 * PRICING
 *   The spreadsheet gives one carpet-area range and one price range per
 *   project (not broken out per configuration). This script linearly
 *   interpolates a carpet area + price for each configuration between the
 *   given min and max, in ascending order (smallest config gets the min,
 *   largest gets the max). Treat these as reasonable placeholders — swap in
 *   exact per-configuration figures from the RERA filing or brochure when
 *   you have them, by editing the `unit_pricing` array Supabase now holds
 *   for each property.
 */
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RawProject {
  title: string;
  developer: string;
  locality: string;
  reraId: string;
  configs: string[]; // e.g. ['1 BHK','2 BHK','3 BHK']
  carpetMin: number;
  carpetMax: number;
  priceMinLakh: number; // in lakhs
  priceMaxLakh: number;
  possessionDate: string; // 'YYYY-MM-DD'
  amenities: string[];
  description: string;
}

function lakhToLabel(lakh: number): string {
  if (lakh >= 100) {
    const cr = lakh / 100;
    return `${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/0$/, '')}Cr`;
  }
  return `${Math.round(lakh)}L`;
}

/** Build a per-configuration unit_pricing array by interpolating between the
 *  project's overall carpet-area and price range. See PRICING note above. */
function buildUnitPricing(p: RawProject) {
  const n = p.configs.length;
  return p.configs.map((unit_type, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    const carpet = Math.round(p.carpetMin + t * (p.carpetMax - p.carpetMin));
    const priceLakh = p.priceMinLakh + t * (p.priceMaxLakh - p.priceMinLakh);
    return {
      unit_type,
      carpet_area: `${carpet} sqft`,
      price: lakhToLabel(priceLakh),
    };
  });
}

// Near-term possession (2027 and earlier) -> under_construction.
// Farther-out possession (2028+) -> new_launch. Adjust as you see fit.
function constructionStatus(possessionDate: string): string {
  const year = new Date(possessionDate).getFullYear();
  return year <= 2027 ? 'under_construction' : 'new_launch';
}

const RAW_PROJECTS: RawProject[] = [
  {
    title: 'Godrej Park World / The Greenfront',
    developer: 'Godrej Properties',
    locality: 'Hinjewadi Phase 1',
    reraId: 'P52100054321',
    configs: ['1 BHK', '2 BHK', '3 BHK'],
    carpetMin: 560, carpetMax: 1248,
    priceMinLakh: 71, priceMaxLakh: 186,
    possessionDate: '2029-12-01',
    amenities: ['12+ Acres Central Park', 'Hydrotherapy Pool', 'Sky Clubhouse', 'Sports Arena', 'Work Pods'],
    description: 'A flagship 22-acre township development featuring high-density green coverage, water-themed sports, EV charging stations, and seamless connectivity to Phase 1 IT parks.',
  },
  {
    title: "Gera's Joy on the Treetops",
    developer: 'Gera Developments',
    locality: 'Hinjewadi Phase 3',
    reraId: 'P52100052890',
    configs: ['2 BHK', '3 BHK'],
    carpetMin: 754, carpetMax: 1238,
    priceMinLakh: 82, priceMaxLakh: 142,
    possessionDate: '2030-03-01',
    amenities: ['Child-centric Academies (Badminton, Tennis, Music)', 'Interactive Waterpark', 'Smart Home Automation', 'Elevated Walkway'],
    description: 'Focuses on child-centric development with academies operated by celebrities, 5-year warranty, automated homes, and extensive indoor/outdoor recreational spaces.',
  },
  {
    title: 'Lodha Panache',
    developer: 'Lodha Group',
    locality: 'Hinjewadi',
    reraId: 'P52100051122',
    configs: ['2 BHK', '3 BHK'],
    carpetMin: 862, carpetMax: 1250,
    priceMinLakh: 138, priceMaxLakh: 230,
    possessionDate: '2027-06-01',
    amenities: ['Resort-style Olympic-length Pool', '25,000 sq ft Clubhouse', 'Rooftop Lounge', 'Private Theatre', 'Organic Garden'],
    description: 'Ultra-luxury residential project bringing low-density resort living to Hinjewadi with world-class amenities and premium Italian marble finishes.',
  },
  {
    title: 'Life Republic - Echoes & Aros',
    developer: 'Kolte-Patil Developers',
    locality: 'Hinjewadi / Marunji',
    reraId: 'P52100034871',
    configs: ['2 BHK', '2.5 BHK', '3 BHK'],
    carpetMin: 720, carpetMax: 1100,
    priceMinLakh: 83, priceMaxLakh: 125,
    possessionDate: '2027-12-01',
    amenities: ['400m Running Track', 'Anisha Global School (in township)', 'Fire Station', 'Botanical Garden', 'High Street Retail'],
    description: 'Part of a massive 400+ acre township ecosystem, offering self-sustained living with operational schools, hospital hubs, and multi-tier security.',
  },
  {
    title: 'ANP Universe',
    developer: 'ANP Corp',
    locality: 'Balewadi',
    reraId: 'P52100048920',
    configs: ['2 BHK', '3 BHK', '4 BHK'],
    carpetMin: 876, carpetMax: 1714,
    priceMinLakh: 138, priceMaxLakh: 307,
    possessionDate: '2028-12-01',
    amenities: ['Infinity Edge Pool', 'Temperature-controlled Pool', 'Multi-purpose Court', 'Banquet Hall', 'Zen Garden'],
    description: 'Ultra-premium high-rise towers located adjacent to Balewadi High Street, offering expansive layouts, 3-side open views, and grand entrance lobbies.',
  },
  {
    title: 'Tej Elevia',
    developer: 'Tejraj Promoters & Developers',
    locality: 'Baner',
    reraId: 'P52100046554',
    configs: ['2 BHK', '3 BHK', '4 BHK'],
    carpetMin: 780, carpetMax: 1450,
    priceMinLakh: 106, priceMaxLakh: 227,
    possessionDate: '2027-12-01',
    amenities: ['Sky Lounge & Observatory', 'Heated Swimming Pool', 'Fitness Center', 'Squash Court', 'Electric Car Charging'],
    description: 'Modern architecture designed for space maximization, placed strategically along the Baner bypass with quick access to both Mumbai Highway and Pune city center.',
  },
  {
    title: 'Palladio La Viento',
    developer: 'Vilas Javdekar Developers',
    locality: 'Mahalunge',
    reraId: 'P52100047800',
    configs: ['2 BHK', '3 BHK'],
    carpetMin: 730, carpetMax: 1080,
    priceMinLakh: 92, priceMaxLakh: 152,
    possessionDate: '2028-03-01',
    amenities: ['Riverfront Promenade', 'Co-working Pods', 'Amphitheatre', 'Infinity Sky Pool', 'Indoor Games', 'Meditation Zone'],
    description: 'Strategically located on the Hinjewadi-Mahalunge bridge connector. Offers zero-wastage layouts, 24/7 power backup, and top-tier construction quality.',
  },
  {
    title: 'Rohan Saroha',
    developer: 'Rohan Builders',
    locality: 'Bhugaon (Bavdhan Extn)',
    reraId: 'P52100053102',
    configs: ['2 BHK', '3 BHK', '4 BHK'],
    carpetMin: 750, carpetMax: 1380,
    priceMinLakh: 84, priceMaxLakh: 175,
    possessionDate: '2028-06-01',
    amenities: ['Hill-view Terrace Deck', 'Camping Zone', 'Cycling Track', 'Swimming Pool', 'Multi-tier Security', 'Clubhouse'],
    description: "Emphasizes Rohan's PLUS homes concept (Perfect Ventilation, Lively Light, Utmost Privacy, Smart Space) with natural hill scenery, ~10 mins from Chandani Chowk.",
  },
  {
    title: 'Supreme Rivana',
    developer: 'Supreme Universal',
    locality: 'Punawale',
    reraId: 'P52100049901',
    configs: ['2 BHK', '3 BHK'],
    carpetMin: 710, carpetMax: 1020,
    priceMinLakh: 85, priceMaxLakh: 130,
    possessionDate: '2027-09-01',
    amenities: ['Riverfront Deck', 'Designer Clubhouse', "Kids' Play Park", 'Senior Citizen Plaza', 'Swimming Pool', 'Gym'],
    description: 'Boutique luxury project offering riverside tranquility coupled with close proximity to the Pune-Mumbai Expressway and Akurdi/PCMC industrial hubs.',
  },
  {
    title: '41 Cosmo / 41 Zillenia',
    developer: 'Krisala Developers',
    locality: 'Tathawade',
    reraId: 'P52100045230',
    configs: ['2 BHK', '3 BHK'],
    carpetMin: 680, carpetMax: 980,
    priceMinLakh: 73, priceMaxLakh: 95,
    possessionDate: '2026-06-01',
    amenities: ['Rooftop Cinema', 'EV Station', 'Gym & Yoga Deck', 'Co-working Hub', 'Digital Gaming Room'],
    description: 'Smartly engineered compact-luxury apartments targeting young IT professionals and investors with highly competitive entry points and modern lifestyle amenities.',
  },
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_/]+/g, '-');
}

async function uploadImagesForProperty(propertyId: string, slug: string) {
  const folder = path.join(__dirname, 'project-images', slug);
  if (!fs.existsSync(folder)) return; // no photos supplied yet — skip quietly

  const files = fs
    .readdirSync(folder)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  if (files.length === 0) return;

  const imageRecords: { property_id: string; image_url: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(folder, files[i]);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(files[i]).slice(1).toLowerCase();
    const storagePath = `${propertyId}/${Date.now()}_${i}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(storagePath, fileBuffer, {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error(`  ✗ image upload failed (${files[i]}):`, uploadError.message);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(storagePath);

    imageRecords.push({ property_id: propertyId, image_url: urlData.publicUrl });
  }

  if (imageRecords.length === 0) return;

  const { error: imagesDbError } = await supabase.from('property_images').insert(imageRecords);
  if (imagesDbError) {
    console.error('  ✗ property_images insert failed:', imagesDbError.message);
    return;
  }

  await supabase
    .from('properties')
    .update({ featured_image: imageRecords[0].image_url })
    .eq('id', propertyId);

  console.log(`  ✓ uploaded ${imageRecords.length} image(s)`);
}

async function seed() {
  for (const p of RAW_PROJECTS) {
    const baseSlug = slugify(p.title);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const unit_pricing = buildUnitPricing(p);

    console.log(`Inserting: ${p.title} (${slug})`);

    const { data: property, error } = await supabase
      .from('properties')
      .insert([
        {
          title: p.title,
          slug,
          description: `${p.description} Developed by ${p.developer}.`,
          locality: p.locality,
          city: 'Pune',
          state: 'Maharashtra',
          address: `${p.locality}, Pune, Maharashtra`,
          rera_id: p.reraId,
          possession_date: p.possessionDate,
          construction_status: constructionStatus(p.possessionDate),
          amenities: p.amenities,
          unit_pricing,
          status: 'active',
        },
      ])
      .select()
      .single();

    if (error || !property) {
      console.error(`  ✗ failed to insert ${p.title}:`, error?.message);
      continue;
    }

    console.log(`  ✓ inserted (id: ${property.id})`);
    await uploadImagesForProperty(property.id, baseSlug);
  }

  console.log('\nDone. Projects with no matching folder in ./project-images were');
  console.log('inserted without a photo — add real, rights-cleared images later');
  console.log('via the /admin/add-project image upload, or by adding a folder');
  console.log('./project-images/<slug>/ and re-running just the image step.');
}

seed();
