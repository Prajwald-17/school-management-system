'use client';

import { useState } from 'react';
import { useForm , RegisterOptions} from 'react-hook-form';
import { schoolValidationRules } from '@/lib/validation';

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image?: FileList;
}

export default function AddSchoolPage() {
  const [message, setMessage] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } =
    useForm<FormData>({ mode: 'onChange' });

const onSubmit = async (data: FormData) => {
  setMessage('');
  let imageName: string | null = null;

  // Debug: Check if image exists
  console.log('Image file:', data.image?.[0]);

  if (data.image?.[0]) {
    const imgForm = new FormData();
    imgForm.append('file', data.image[0]);
    
    console.log('Uploading image...');
    
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: imgForm,
    });
    
    const uploadJson = await uploadRes.json();
    console.log('Upload response:', uploadJson);
    
    if (!uploadJson.success) {
      setMessage('Image upload failed');
      return;
    }
    imageName = uploadJson.fileName;
    console.log('Image uploaded as:', imageName);
  }

  // Submit school data
  const form = new FormData();
  form.append('name', data.name);
  form.append('address', data.address);
  form.append('city', data.city);
  form.append('state', data.state);
  form.append('contact', data.contact);
  form.append('email_id', data.email_id);
  
  if (imageName) {
    form.append('image', imageName);
    console.log('Including image in school data:', imageName);
  }

  console.log('Submitting school data...');
  
  const res = await fetch('/api/schools', {
    method: 'POST',
    body: form,
  });
  
  const json = await res.json();
  console.log('School submission response:', json);
  
  if (json.success) {
    setMessage('School added successfully');
    reset();
  } else {
    setMessage(`Error: ${json.error}`);
  }
};

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Add New School</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1">Name *</label>
          <input
            type="text"
            {...register('name', schoolValidationRules.name)}
            className="w-full border p-2 rounded"
          />
          {errors.name?.message && (
            <p className="text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1">Address *</label>
          <textarea
            {...register('address', schoolValidationRules.address)}
            className="w-full border p-2 rounded"
          />
          {errors.address?.message && (
            <p className="text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">City *</label>
            <input
              type="text"
              {...register('city', schoolValidationRules.city)}
              className="w-full border p-2 rounded"
            />
            {errors.city?.message && (
              <p className="text-red-600">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1">State *</label>
            <input
              type="text"
              {...register('state', schoolValidationRules.state)}
              className="w-full border p-2 rounded"
            />
            {errors.state?.message && (
              <p className="text-red-600">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Contact & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Contact *</label>
            <input
              type="tel"
              {...register('contact', schoolValidationRules.contact)}
              className="w-full border p-2 rounded"
            />
            {errors.contact?.message && (
              <p className="text-red-600">{errors.contact.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1">Email *</label>
            <input
              type="email"
              {...register('email_id', schoolValidationRules.email_id)}
              className="w-full border p-2 rounded"
            />
            {errors.email_id?.message && (
              <p className="text-red-600">{errors.email_id.message}</p>
            )}
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block mb-1">Image (optional)</label>
         <input
          type="file"
          accept="image/*"
          {...register('image', schoolValidationRules.image as RegisterOptions<FormData, 'image'>)}
          onChange={(e) => {
          console.log('File input onChange:', e.target.files);
          }}
          className="w-full"
           />
          {errors.image?.message && <p className="text-red-600">{errors.image.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-4 py-2 bg-teal-600 text-white rounded"
        >
          Add School
        </button>

        {/* Message */}
        {message && <p className="mt-2">{message}</p>}
      </form>
    </div>
  );
}
