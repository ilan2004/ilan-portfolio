import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { cloudinary } from '../../utils/cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { auto } from '@cloudinary/url-gen/qualifiers/quality';
import { auto as autoFormat } from '@cloudinary/url-gen/qualifiers/format';

const CloudinaryImage = ({
  publicId,
  alt,
  className,
  width = 800,
  height,
  loading = "lazy",
  ...props
}) => {
  if (!publicId) return null;
  
  // Create a Cloudinary image with the public ID
  const cldImage = cloudinary.image(publicId);
  
  // Apply transformations
  if (width || height) {
    const resize = fill();
    if (width) resize.width(width);
    if (height) resize.height(height);
    cldImage.resize(resize);
  }
  
  // Set automatic format and quality
  cldImage
    .delivery(format(autoFormat()))
    .delivery(quality(auto()));
  
  return (
    <AdvancedImage
      cldImg={cldImage}
      alt={alt || ""}
      className={className}
      loading={loading}
      {...props}
    />
  );
};

export default CloudinaryImage;