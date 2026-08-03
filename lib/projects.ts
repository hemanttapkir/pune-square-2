// Simple client-side project store backed by localStorage.
// This is the file page.tsx expects at "@/lib/projects".
// Swap this out for a real API/database later without changing
// the shape of Project or the function names below.

export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Studio', 'Penthouse', 'Plot', 'Commercial'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface Project {
  id: string;
  slug: string;
  title: string;
  location: string;
  price: string; // e.g. "₹1.2Cr"
  rera: boolean;
  propertyType?: PropertyType;
  imagesUrl?: string[];
  description?: string;
}

import { PROJECTS as STATIC_PROJECTS } from './projects-data';

const STORAGE_KEY = 'pune-square-projects';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getLocalProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    return [];
  }
}

// The real, always-visible catalog: hardcoded projects first, then anything
// added locally through /agent (only visible in the browser that added them —
// handy for previewing before you commit it to lib/projects-data.ts).
export function getProjects(): Project[] {
  return [...STATIC_PROJECTS, ...getLocalProjects()];
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function addProject(input: Omit<Project, 'id' | 'slug'> & { slug?: string }): Project {
  const localProjects = getLocalProjects();
  const project: Project = {
    id: crypto.randomUUID(),
    slug: input.slug || slugify(input.title),
    ...input,
  };
  localProjects.push(project);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localProjects));
  return project;
}

export function deleteProject(id: string): void {
  const localProjects = getLocalProjects().filter((p) => p.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(localProjects));
}
