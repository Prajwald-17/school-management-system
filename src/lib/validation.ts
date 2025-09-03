export const schoolValidationRules = {
  name: {
    required: 'School name is required',
    minLength: {
      value: 2,
      message: 'School name must be at least 2 characters'
    },
    maxLength: {
      value: 100,
      message: 'School name must be less than 100 characters'
    }
  },
  address: {
    required: 'Address is required',
    minLength: {
      value: 5,
      message: 'Address must be at least 5 characters'
    }
  },
  city: {
    required: 'City is required',
    minLength: {
      value: 2,
      message: 'City must be at least 2 characters'
    },
    pattern: {
      value: /^[a-zA-Z\s]+$/,
      message: 'City should only contain letters and spaces'
    }
  },
  state: {
    required: 'State is required',
    minLength: {
      value: 2,
      message: 'State must be at least 2 characters'
    }
  },
  contact: {
    required: 'Contact number is required',
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Contact number must be exactly 10 digits'
    }
  },
  email_id: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address'
    }
  },
  image: {
    validate: {
      fileType: (files: FileList) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        return allowedTypes.includes(file.type) || 'Only JPEG, PNG, and WebP files are allowed';
      },
      fileSize: (files: FileList) => {
        if (!files || files.length === 0) return true;
        const file = files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB
        return file.size <= maxSize || 'File size must be less than 5MB';
      }
    }
  }
};
