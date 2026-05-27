const FILE_SERVER_URL = import.meta.env.VITE_FILE_SERVER_URL || 'https://truetouch-admin.onrender.com';

export const constructFileUrl = (relativePath) => {
  if (!relativePath) return null;
  const fullUrl = `${FILE_SERVER_URL}/uploads/${relativePath}`;
  // Use proxy for external images to avoid CORS issues
  return `/api/proxy-image?url=${encodeURIComponent(fullUrl)}`;
};

export const getCandidateProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  return `/uploads/candidates/profile_pictures/${profilePicture}`;
};

export const getCandidateCvUrl = (cv) => {
  return constructFileUrl(cv);
};

export const getJobImageUrl = (imageUrl) => {
  return constructFileUrl(imageUrl);
};
