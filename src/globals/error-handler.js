import { toast } from 'sonner';

const defaultErrorMessages = {
  'fetch': 'Network error. Please check your connection and try again.',
  'validation': 'Invalid input. Please check your data and try again.',
  'timeout': 'Request timed out. Please try again.',
  'unauthorized': 'You are not authorized. Please log in again.',
  'forbidden': 'Access denied.',
  'notfound': 'The requested resource was not found.',
  'conflict': 'Conflict with existing data.',
  'servererror': 'Server error. Please try again later.',
  'unknown': 'An unexpected error occurred. Please try again.'
};

const getErrorMessage = (error, category = 'unknown') => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.status) {
    const status = error.response.status;
    if (status === 401) return defaultErrorMessages.unauthorized;
    if (status === 403) return defaultErrorMessages.forbidden;
    if (status === 404) return defaultErrorMessages.notfound;
    if (status === 409) return defaultErrorMessages.conflict;
    if (status >= 500) return defaultErrorMessages.servererror;
  }

  return defaultErrorMessages[category] || defaultErrorMessages.unknown;
};

export const showErrorToast = (error, customMessage = null) => {
  const message = customMessage || getErrorMessage(error);
  toast.error(message);
};

export const showSuccessToast = (message) => {
  toast.success(message);
};

export const showInfoToast = (message) => {
  toast.info(message);
};

export const showWarningToast = (message) => {
  toast.warning(message);
};

export const handleError = (error, callback = null) => {
  showErrorToast(error);
  if (callback) callback(error);
};

export default {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  handleError,
  getErrorMessage
};
