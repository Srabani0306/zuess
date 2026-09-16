export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    me: "/api/auth/me",
  },
  public: {
    enquiries: "/api/enquiries",
    navigation: "/api/navigation",
    pages: (slug) => `/api/pages/${slug}`,
  },
  admin: {
    pages: "/api/admin/pages",
    page: (id) => `/api/admin/pages/${id}`,
    navigation: "/api/admin/navigation",
    navigationItem: (id) => `/api/admin/navigation/${id}`,
    media: "/api/admin/media",
    upload: "/api/admin/upload",
  },
};
