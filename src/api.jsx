// api.jsx - API service functions
const API_BASE_URL = 'https://urbanviewre.com/cpd_certificate_backend/public/api';

// Generic API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token
  const tokenData = authToken.get();
  
  const config = {
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization header if token exists
  if (tokenData && tokenData.token) {
    config.headers['Authorization'] = `${tokenData.type} ${tokenData.token}`;
  }

  // Don't stringify if it's FormData (it will set its own Content-Type)
  if (options.body && !(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // If unauthorized, clear tokens and redirect to login
      if (response.status === 401) {
        authToken.clear();
        userManager.clearUser();
        window.location.href = '/login';
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('API request failed:', error);
    return { 
      success: false, 
      error: error.message || 'Network error occurred' 
    };
  }
};

// Cookie helper functions
export const setCookie = (name, value, days = 30) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAge}; Path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
};

export const getCookie = (name) => {
  const key = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split('; ');
  const foundCookie = cookies.find((row) => row.startsWith(key));
  
  if (foundCookie) {
    return decodeURIComponent(foundCookie.slice(key.length));
  }
  return '';
};

export const deleteCookie = (name) => {
  document.cookie = `${encodeURIComponent(
    name
  )}=; Max-Age=0; Path=/; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
};

// Auth token management
export const authToken = {
  set: (tokenData) => {
    const { access_token, token_type = 'Bearer', expires_in = 30 } = tokenData;
    
    if (access_token) {
      setCookie('authToken', access_token, expires_in);
      setCookie('tokenType', token_type, expires_in);
    }
  },

  get: () => {
    const token = getCookie('authToken');
    const tokenType = getCookie('tokenType') || 'Bearer';
    
    return token ? { token, type: tokenType } : null;
  },

  clear: () => {
    deleteCookie('authToken');
    deleteCookie('tokenType');
    deleteCookie('refreshToken');
    deleteCookie('rememberMe');
    deleteCookie('rememberEmail');
  },

  isValid: () => {
    const token = getCookie('authToken');
    return !!token;
  }
};

// User data management
export const userManager = {
  setUser: (userData) => {
    if (userData) {
      sessionStorage.setItem('user_id', userData.id || '');
      sessionStorage.setItem('user_name', userData.full_name || userData.name || '');
      sessionStorage.setItem('user_email', userData.email || '');
      sessionStorage.setItem('user_role', userData.role || '');
      sessionStorage.setItem('isAuthenticated', 'true');
    }
  },

  getUser: () => {
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
      return {
        id: sessionStorage.getItem('user_id'),
        name: sessionStorage.getItem('user_name'),
        email: sessionStorage.getItem('user_email'),
        role: sessionStorage.getItem('user_role'),
      };
    }
    return null;
  },

  clearUser: () => {
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_name');
    sessionStorage.removeItem('user_email');
    sessionStorage.removeItem('user_role');
    sessionStorage.removeItem('isAuthenticated');
  },

  isAuthenticated: () => {
    return sessionStorage.getItem('isAuthenticated') === 'true' && authToken.isValid();
  }
};

// Certificate API functions
export const certificateAPI = {
  // Get all certificates
  getAll: async () => {
    return await apiRequest('/cpd-certificates');
  },

  // Get single certificate
  getById: async (id) => {
    return await apiRequest(`/cpd-certificates/${id}`);
  },

  // Create certificate
  create: async (certificateData) => {
    return await apiRequest('/cpd-certificates', {
      method: 'POST',
      body: certificateData
    });
  },

  // Update certificate - handles both JSON and FormData
  update: async (id, certificateData, isFormData = false) => {
    if (isFormData || certificateData instanceof FormData) {
      // For FormData, let the browser set the Content-Type with boundary
      return await apiRequest(`/cpd-certificates/${id}`, {
        method: 'POST', // Use POST for file uploads with Laravel
        headers: {
          // Don't set Content-Type, let browser set it with boundary
        },
        body: certificateData
      });
    } else {
      // For regular JSON data
      return await apiRequest(`/cpd-certificates/${id}`, {
        method: 'PUT',
        body: certificateData
      });
    }
  },

  // Delete certificate
  delete: async (id) => {
    return await apiRequest(`/cpd-certificates/${id}`, {
      method: 'DELETE'
    });
  },

  // Upload certificate file
  uploadCertificate: async (id, formData) => {
    return await apiRequest(`/cpd-certificates/${id}/upload-certificate`, {
      method: 'POST',
      body: formData
    });
  },

  // Mark as generated with file upload
  markAsGenerated: async (id, formData) => {
    return await apiRequest(`/cpd-certificates/${id}/mark-generated`, {
      method: 'POST',
      body: formData
    });
  }
};

// Auth API functions
export const authAPI = {
  // Login user
  login: async (email, password) => {
    return await apiRequest('/login', {
      method: 'POST',
      body: { email, password }
    });
  },

  // Logout user
  logout: async () => {
    const token = getCookie('authToken');
    return await apiRequest('/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get user profile
  getProfile: async () => {
    return await apiRequest('/user');
  },
};

// Auth status checker
export const checkAuthStatus = () => {
  return userManager.isAuthenticated();
};

// Logout function
export const logout = () => {
  authToken.clear();
  userManager.clearUser();
  window.location.href = '/login';
};

// Default export
export default apiRequest;