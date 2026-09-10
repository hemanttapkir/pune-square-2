'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, PROPERTY_TYPES, PropertyType } from '@/lib/projects';

export default function AgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [rera, setRera] = useState(false);
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment');
  const [imagesUrl, setImagesUrl] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !price.trim()) return;

    setLoading(true);

    try {
      await createProject({
        title: title.trim(),
        locality: location.trim(),
        price: price.trim(),
        rera,
        propertyType,
        description: description.trim() || undefined,
        imagesUrl: imagesUrl
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean),
      });

      router.push('/');
    } catch (err) {
      console.error(err);
      alert('Failed to save project.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ padding: '64px 32px', maxWidth: 640 }}>
      <h1 style={{ marginBottom: 24 }}>Add a new project</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
        <label>
          Project title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
        </label>
        <label>
          Location (locality name, e.g. Hinjewadi)
          <input value={location} onChange={(e) => setLocation(e.target.value)} required style={inputStyle} />
        </label>
        <label>
          Starting price (e.g. ₹1.2Cr or ₹85L)
          <input value={price} onChange={(e) => setPrice(e.target.value)} required style={inputStyle} />
        </label>
        <label>
          Property type
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)} style={inputStyle}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Image URLs (comma-separated)
          <input value={imagesUrl} onChange={(e) => setImagesUrl(e.target.value)} style={inputStyle} />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={inputStyle} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={rera} onChange={(e) => setRera(e.target.checked)} />
          MahaRERA registered
        </label>
        <button type="submit" disabled={loading} className="btn btn-solid" style={{ justifySelf: 'start' }}>
          {loading ? 'Saving...' : 'Save project'}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius)',
  fontFamily: 'inherit',
  fontSize: 14,
};
