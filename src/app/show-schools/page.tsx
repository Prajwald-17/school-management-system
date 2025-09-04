'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface schools {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  contact: number;
  image: string;
  email_id: string;
}

export default function ShowSchoolsPage() {
  const [schools, setSchools] = useState<schools[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      const result = await response.json();
      if (result.success) {
        setSchools(result.schools);
      } else {
        setError('Failed to fetch schools');
      }
    } catch {
      setError('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSchools}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Our Schools
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Discover educational institutions in your area
          </p>
        </div>
      </div>
      {/* Schools Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {schools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No schools found</p>
            <a
              href="/add-school"
              className="mt-4 inline-block px-6 py-3 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Add First School
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SchoolCard({ school }: { school: schools }) {
  const [imageError, setImageError] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowContactDropdown(false);
      }
    }
    if (showContactDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showContactDropdown]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-visible hover:shadow-lg transition-shadow duration-300">
      {/* School Image */}
    <div className="relative h-48 bg-gray-200">
      {school.image && !imageError ? (
    <Image
      src={school.image.startsWith('http') ? school.image : `/schoolImages/${school.image}`}
      alt={school.name}
      fill
      className="object-cover"
      onError={() => setImageError(true)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
     />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <svg
        className="w-16 h-16 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    </div>
  )}
</div>

      {/* School Details */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {school.name}
        </h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="line-clamp-2">{school.address}</p>
              <p className="font-medium">{school.city}</p>
            </div>
          </div>
        </div>

        {/* Contact Button with Dropdown */}
        <div className="mt-4 relative" ref={dropdownRef}>
          <button
            onClick={() => setShowContactDropdown(!showContactDropdown)}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Contact School</span>
            <svg 
              className={`w-4 h-4 transform transition-transform duration-200 ${showContactDropdown ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {/* Contact Dropdown */}
          {showContactDropdown && (
            <div className="contact-dropdown animate-fadeIn">
              <div className="p-3 space-y-3">
                {/* Phone Contact */}
                <a
                  href={`tel:${school.contact}`}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Call</p>
                    <p className="text-xs text-gray-500">{school.contact}</p>
                  </div>
                </a>
                {/* Email Contact */}
                <a
                  href={`mailto:${school.email_id}`}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-xs text-gray-500 break-all">{school.email_id}</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
