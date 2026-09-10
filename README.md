# Seeding the 10 West Pune projects

## 1. Run the seed script
```bash
npm install -D tsx            # if you don't already have a TS runner
npx tsx scripts/seed-projects.ts
```
Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
set in your environment (same values your app already uses in `lib/supabase.ts`).

This inserts all 10 properties into `properties` with correct locality, city,
RERA number, possession date, amenities, and a per-configuration
`unit_pricing` array — no image required to run this step.

## 2. Adding real images (do this properly, not by scraping)

The builder marketing photos for these projects are copyrighted, and most are
explicitly licensed "for representation only" — reusing them on a third-party
site is a real infringement risk, not just red tape. Get images one of these
ways instead:
- Ask the developer/broker for a media kit (most give registered channel
  partners marketing images for legitimate resale/listing use)
- Your own site-visit photography or the RERA-filed brochure (with
  permission)
- Licensed stock photography as a placeholder until real photos are ready

Once you have rights-cleared photos, drop them into a folder per project
(any of `.jpg` `.jpeg` `.png` `.webp`, numbered so the first becomes the
featured image):

```
scripts/project-images/godrej-park-world-the-greenfront/1.jpg
scripts/project-images/godrej-park-world-the-greenfront/2.jpg
scripts/project-images/geras-joy-on-the-treetops/1.jpg
scripts/project-images/lodha-panache/1.jpg
scripts/project-images/life-republic---echoes-aros/1.jpg
scripts/project-images/anp-universe/1.jpg
scripts/project-images/tej-elevia/1.jpg
scripts/project-images/palladio-la-viento/1.jpg
scripts/project-images/rohan-saroha/1.jpg
scripts/project-images/supreme-rivana/1.jpg
scripts/project-images/41-cosmo-41-zillenia/1.jpg
```

Then re-run the script — it uploads to your `property-images` bucket and
sets `featured_image` exactly the way `/admin/add-project` does. If you've
already inserted the properties, comment out the insert block temporarily,
or just add images later straight from `/admin/add-project` per listing
(simplest option since that page already handles upload).

## 3. Pricing note
The spreadsheet gives one carpet-area range and one price range per project,
not per configuration. The script linearly interpolates a value per BHK type
between the min and max. Treat these as reasonable starting numbers — edit
the `unit_pricing` JSON in Supabase directly once you have exact
per-configuration pricing from the brochure/RERA filing.
