// Firebase error codes and their user-friendly messages
const errorMessages = {
  'auth/email-already-in-use': 'This email is already registered. Please try logging in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email. Please check your email or register.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested resource was not found.',
  'already-exists': 'This resource already exists.',
  'unauthenticated': 'Please log in to continue.',
  'default': 'An error occurred. Please try again.'
};

export function getErrorMessage(error) {
  // Handle Firebase Auth errors
  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }
  
  // Handle Firestore errors
  if (error.code === 'permission-denied') {
    return errorMessages['permission-denied'];
  }
  
  // Handle network errors
  if (error.message && error.message.includes('network')) {
    return errorMessages['auth/network-request-failed'];
  }
  
  // Return default error message
  return errorMessages['default'];
}

export function handleError(error, setError) {
  console.error('Error:', error);
  const message = getErrorMessage(error);
  setError(message);
} 