const FILE_SERVER_URL = import.meta.env.VITE_FILE_SERVER_URL;

const constructFullFileUrl = (relativePath) => {
  if (!relativePath || !FILE_SERVER_URL) return null;
  return `${FILE_SERVER_URL}/uploads/${relativePath}`;
};

export const getCandidateProfilePictureUrl = (filename) => {
  if (!filename) return null;
  return constructFullFileUrl(`candidates/profile_pictures/${filename}`);
};

export const getCandidateCvUrl = (filename) => {
  if (!filename) return null;
  return constructFullFileUrl(`candidates/cv/${filename}`);
};

export const getJobImageUrl = (relativePath) => {
  if (!relativePath) return null;
  return constructFullFileUrl(relativePath);
};
