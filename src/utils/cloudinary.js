import { Cloudinary } from '@cloudinary/url-gen';

export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dihv4duqb',
};

// Create a Cloudinary instance with your cloud name
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName,
  },
  url: {
    secure: true, // Force HTTPS
  },
});