const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://talentgrid-api.vercel.app';

/**
 * Core server fetch utility for GET requests
 */
export const serverFetch = async (path, options = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error ${res.status}`);
  }
  return res.json();
};

/**
 * Core server mutation utility for POST, PATCH, PUT, DELETE requests
 */
export const serverMutation = async (path, data, method = 'POST') => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error ${res.status}`);
  }
  return res.json();
};