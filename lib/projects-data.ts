import { Project } from './projects';

// This is the real, hardcoded list of projects shown to every visitor.
// Add, edit, or remove entries here directly — this is your source of truth.
//
// propertyType must be one of: 'Apartment' | 'Villa' | 'Studio' | 'Penthouse' | 'Plot'
// price should be formatted like '₹85L' or '₹1.2Cr' so budget filtering works.

export const PROJECTS: Project[] = [
  {
    id: 'the-anthem-anand-park-aundh',
    slug: 'the-anthem-anand-park-aundh',
    title: 'The Anthem',
    location: 'Anand Park, Aundh, Pune',
    price: 'Price on request',
    rera: true, // MahaRERA: P52100052869
    propertyType: 'Commercial',
    imagesUrl: [
      '/projects/the-anthem/exterior.jpg',
      '/projects/the-anthem/retail-frontage.jpg',
      '/projects/the-anthem/lobby.jpg',
      '/projects/the-anthem/lounge.jpg',
      '/projects/the-anthem/conference-room.jpg',
    ],
    description:
      'A new-age business destination in the heart of Aundh by Banyan Tree Realty — 150+ boutique offices and 7 retail units across 150,000 sq. ft. of Vaastu-compliant commercial space. Features western India\u2019s first robotic parking system (194-car capacity), 3 high-speed elevators, double-glazed glass facade, and a majestic marble-finished entrance lobby. Located 500m from Baner Main Road, close to Baner Metro Station, and 20 minutes from Hinjewadi Phase 1.',
  },
];
