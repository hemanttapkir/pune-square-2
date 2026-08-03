'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    locality: '',
    city: 'Pune',
    state: 'Maharashtra',
    address: '',
    rera_id: '',
    possession_date: '',
    construction_status: 'under_construction',
    amenitiesInput: '',
  });

  // Dynamic Unit Pricing State
  const [unitPricing, setUnitPricing] = useState([
    { unit_type: '2 BHK', carpet_area: '', price: '' }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUnitChange = (index: number, field: string, value: string) => {
    const updated = [...unitPricing];
    updated[index] = { ...updated[index], [field]: value };
    setUnitPricing(updated);
  };

  const addUnitRow = () => {
    setUnitPricing([...unitPricing, { unit_type: '3 BHK', carpet_area: '', price: '' }]);
  };

  const removeUnitRow = (index: number) => {
    setUnitPricing(unitPricing.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseSlug = formData.slug || formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-');
      
      // Add unique suffix
      const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      
      const amenitiesArray = formData.amenitiesInput
        ? formData.amenitiesInput.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
      
      const newProject = {
        ...formData,
        slug: slug,
        // ...other properties
      };
      
      // Send to Supabase...
      // 1. Insert Property Row First
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert([
          {
            title: formData.title,
            slug: slug,
            description: formData.description,
            locality: formData.locality,
            city: formData.city,
            state: formData.state,
            address: formData.address,
            rera_id: formData.rera_id || null,
            possession_date: formData.possession_date || null,
            construction_status: formData.construction_status,
            amenities: amenitiesArray,
            unit_pricing: unitPricing,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (propertyError) throw propertyError;
      if (!property?.id) throw new Error('Failed to retrieve project ID.');

      // 2. Safe Image Upload
      let featuredImageUrl = '';

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];

          // Sanitize Extension (force clean lowercase alphanumerics like jpg, png, webp)
          const rawExt = file.name.split('.').pop() || 'jpg';
          const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');

          // Strict path construction: e.g. "a1b2c3d4-1234-5678/1722700000_0.jpg"
          const storagePath = `${property.id}/${Date.now()}_${i}.${cleanExt}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error('Storage Upload Error Detail:', uploadError);
            throw new Error(`Storage Error (${uploadError.name}): ${uploadError.message}`);
          }

          // Fetch Public URL
          const { data: urlData } = supabase.storage
            .from('property-images')
            .getPublicUrl(storagePath);

          const publicUrl = urlData.publicUrl;

          // Insert into property_images table
          await supabase.from('property_images').insert([
            { property_id: property.id, image_url: publicUrl }
          ]);

          if (i === 0) {
            featuredImageUrl = publicUrl;
          }
        }

        // Update featured image on main property record
        if (featuredImageUrl) {
          await supabase
            .from('properties')
            .update({ featured_image: featuredImageUrl })
            .eq('id', property.id);
        }
      }

      alert('Project added successfully!');
      router.push(`/projects/${slug}`);
    } catch (err: any) {
      console.error('Submit Error:', err);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '24px' }}>
      <h1>Add New Real Estate Project</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        
        <div>
          <label>Project Title *</label>
          <input name="title" required value={formData.title} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>MahaRERA Registration No.</label>
          <input 
            name="rera_id" 
            placeholder="e.g. P52100012345" 
            value={formData.rera_id} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label>Locality / Area *</label>
            <input name="locality" required value={formData.locality} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>City *</label>
            <input name="city" required value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>

        <div>
          <label>Full Address</label>
          <input name="address" required value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label>Possession Date</label>
            <input type="date" name="possession_date" value={formData.possession_date} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Status</label>
            <select name="construction_status" value={formData.construction_status} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
              <option value="under_construction">Under Construction</option>
              <option value="ready_to_move">Ready to Move</option>
              <option value="new_launch">New Launch</option>
            </select>
          </div>
        </div>

        {/* Dynamic Unit Pricing */}
        <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold' }}>Unit Configurations & Pricing</label>
          {unitPricing.map((unit, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input 
                placeholder="Type (e.g. 2 BHK)" 
                value={unit.unit_type} 
                onChange={(e) => handleUnitChange(i, 'unit_type', e.target.value)} 
                style={{ flex: 1, padding: '6px' }} 
              />
              <input 
                placeholder="Carpet Area (e.g. 750 sqft)" 
                value={unit.carpet_area} 
                onChange={(e) => handleUnitChange(i, 'carpet_area', e.target.value)} 
                style={{ flex: 1, padding: '6px' }} 
              />
              <input 
                placeholder="Price (e.g. ₹65 Lakhs)" 
                value={unit.price} 
                onChange={(e) => handleUnitChange(i, 'price', e.target.value)} 
                style={{ flex: 1, padding: '6px' }} 
              />
              {unitPricing.length > 1 && (
                <button type="button" onClick={() => removeUnitRow(i)} style={{ color: 'red' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addUnitRow} style={{ marginTop: '8px', padding: '4px 8px' }}>
            + Add Unit Type
          </button>
        </div>

        <div>
          <label>Amenities (Comma-separated)</label>
          <input 
            name="amenitiesInput" 
            placeholder="Swimming Pool, Gym, Clubhouse, Security" 
            value={formData.amenitiesInput} 
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px' }} 
          />
        </div>

        <div>
          <label>Description</label>
          <textarea name="description" rows={4} value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Property Images</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} style={{ width: '100%', padding: '8px' }} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '12px', background: '#000', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Saving Property...' : 'Save & Publish Listing'}
        </button>
      </form>
    </div>
  );
}