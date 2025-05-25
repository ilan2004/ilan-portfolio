import { Cloudinary } from '@cloudinary/url-gen';

export const cloudinaryConfig = {
  cloudName: "dihv4duqb",
  apiKey: "546642197493214",
  apiSecret: "RoSwZm2Dti_vwlmYg9WTyirIQf4",
};

// Create a Cloudinary instance with your cloud name
export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName
  },
  url: {
    secure: true // Force HTTPS
  }
});