'use client';

import { useState, useEffect } from 'react';
import { useForm, RegisterOptions } from 'react-hook-form';
import { schoolValidationRules } from '@/lib/validation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, reset } =
    useForm<FormData>({ mode: 'onChange' });

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login?redirect=/add-school');
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // Will redirect via useEffect
  }

  const onSubmit = async (data: FormData) => {
    setMessage('');
    setIsSubmitting(true);
    let imageUrl: string | null = null;

    try {
      // Upload image to Cloudinary if present
      if (data.image?.[0]) {
        const imgForm = new FormData();
        imgForm.append('file', data.image[0]);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imgForm,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
          setMessage('Image upload failed');
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadJson.url; // Use Cloudinary URL
      }

      // Prepare final form and submit
      const form = new FormData();
      form.append('name', data.name);
      form.append('address', data.address);
      form.append('city', data.city);
      form.append('state', data.state);
      form.append('contact', data.contact);
      form.append('email_id', data.email_id);
      if (imageUrl) {
        form.append('image', imageUrl);
      }

      const res = await fetch('/api/schools', {
        method: 'POST',
        body: form,
      });
      const json = await res.json();

      if (json.success) {
        setMessage('✅ School added successfully!');
        reset();
      } else {
        setMessage(`❌ Error: ${json.error}`);
      }
    } catch (error) {
      setMessage('❌ An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow text-gray-900">
      <h1 className="text-2xl font-bold mb-4">Add New School</h1>
      <p className="text-sm text-gray-600 mb-6">
        Welcome, {user.email}! You can add a new school to the system.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">School Name *</label>
          <input
            type="text"
            {...register('name', schoolValidationRules.name)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Enter school name"
          />
          {errors.name?.message && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 font-medium">Address *</label>
          <textarea
            {...register('address', schoolValidationRules.address)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={3}
            placeholder="Enter full address"
          />
          {errors.address?.message && (
            <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* City & State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">City *</label>
            <input
              type="text"
              {...register('city', schoolValidationRules.city)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter city"
            />
            {errors.city?.message && (
              <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">State *</label>
            <input
              type="text"
              {...register('state', schoolValidationRules.state)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter state"
            />
            {errors.state?.message && (
              <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Contact & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Contact *</label>
            <input
              type="tel"
              {...register('contact', schoolValidationRules.contact)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter contact number"
            />
            {errors.contact?.message && (
              <p className="text-red-600 text-sm mt-1">{errors.contact.message}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              {...register('email_id', schoolValidationRules.email_id)}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Enter email address"
            />
            {errors.email_id?.message && (
              <p className="text-red-600 text-sm mt-1">{errors.email_id.message}</p>
            )}
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block mb-1 font-medium">School Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            {...register('image', schoolValidationRules.image as RegisterOptions<FormData, 'image'>)}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          {errors.image?.message && <p className="text-red-600 text-sm mt-1">{errors.image.message}</p>}
          <p className="text-sm text-gray-500 mt-1">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-teal-600 text-white rounded font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Adding School...' : 'Add School'}
        </button>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded ${
            message.includes('successfully') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
