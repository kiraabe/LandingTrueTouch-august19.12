const FILE_SERVER_URL = import.meta.env.VITE_FILE_SERVER_URL || 'https://truetouch-admin.onrender.com';

export const constructFileUrl = (relativePath) => {
  if (!relativePath) return null;
  return `${FILE_SERVER_URL}/uploads/${relativePath}`;
};

export const getCandidateProfilePictureUrl = (profilePicture) => {
  return constructFileUrl(profilePicture);
};

export const getCandidateCvUrl = (cv) => {
  return constructFileUrl(cv);
};

export const getJobImageUrl = (imageUrl) => {
  return constructFileUrl(imageUrl);
};
