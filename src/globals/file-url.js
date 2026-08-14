const FILE_SERVER_URL = (import.meta.env.VITE_FILE_SERVER_URL || '').trim().replace(/\/+$/, '');
const ASSET_BASE_URL = FILE_SERVER_URL && !FILE_SERVER_URL.includes("cdn.builder.io") ? FILE_SERVER_URL : "";

export const getHostedAssetUrl = (path) => `${ASSET_BASE_URL}/assets/${path}`;
export const candidateProfileFallback = getHostedAssetUrl("images/candidates/pic1.jpg");

const constructFullFileUrl = (relativePath) => {
  if (!relativePath) return null;
  const baseUrl = FILE_SERVER_URL.includes("cdn.builder.io") ? "" : FILE_SERVER_URL;
  return `${baseUrl}/uploads/${relativePath}`;
};

export const getCandidateProfilePictureUrl = (filename) => {
  if (!filename) return null;
  const imageUrl = filename.startsWith('http://') || filename.startsWith('https://')
    ? filename
    : constructFullFileUrl(`candidates/profile_pictures/${filename}`);
  return imageUrl;
};

export const getCandidateCvUrl = (filename) => {
  if (!filename) return null;
  const fileUrl = filename.startsWith('http://') || filename.startsWith('https://')
    ? filename
    : constructFullFileUrl(`candidates/cvs/${filename}`);

  if (FILE_SERVER_URL && (fileUrl?.startsWith('http://') || fileUrl?.startsWith('https://'))) {
    return `/api/proxy-file?url=${encodeURIComponent(fileUrl)}`;
  }

  return fileUrl;
};

export const getJobImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's an external URL, proxy it through the api
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const encodedUrl = encodeURIComponent(imagePath);
    return `/api/proxy-image?url=${encodedUrl}`;
  }

  // Otherwise treat as a relative path
  return constructFullFileUrl(imagePath);
};

export const getTestimonialAvatarUrl = (filepath) => {
  if (!filepath) return null;

  // If it's an external URL, proxy it through the api
  if (filepath.startsWith('http://') || filepath.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(filepath)}`;
  }

  // If it already contains "testimonials/", use it as-is, otherwise prepend the path
  const fullPath = filepath.includes('testimonials/')
    ? filepath
    : `testimonials/${filepath}`;

  const imageUrl = constructFullFileUrl(fullPath);
  return imageUrl ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}` : null;
};
