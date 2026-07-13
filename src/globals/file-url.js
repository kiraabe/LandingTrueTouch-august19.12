const FILE_SERVER_URL = import.meta.env.VITE_FILE_SERVER_URL;

const constructFullFileUrl = (relativePath) => {
  if (!relativePath || !FILE_SERVER_URL) return null;
  return `${FILE_SERVER_URL}/uploads/${relativePath}`;
};

export const getCandidateProfilePictureUrl = (filename) => {
  if (!filename) return null;
  const imageUrl = filename.startsWith('http://') || filename.startsWith('https://')
    ? filename
    : constructFullFileUrl(`candidates/profile_pictures/${filename}`);
  return imageUrl ? `/api/proxy-image?url=${encodeURIComponent(imageUrl)}` : null;
};

export const getCandidateCvUrl = (filename) => {
  if (!filename) return null;
  return constructFullFileUrl(`candidates/cvs/${filename}`);
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
