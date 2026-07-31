'use server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

/**
 * Create a new company profile for a recruiter
 */
export const createCompany = async (companyData) => {
  const res = await fetch(`${baseUrl}/api/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(companyData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Server error ${res.status}`);
  }
  return res.json();
};

/**
 * Get a single company by its MongoDB ID
 * Usage: getCompanyById('64abc123...')
 * Browser: http://localhost:5000/api/companies/ID
 */
export const getCompanyById = async (id) => {
  const res = await fetch(`${baseUrl}/api/companies/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Company not found');
  }
  return res.json();
};

/**
 * Get all companies with optional filters
 * Usage: getCompanies({ search: 'Google', isApproved: true })
 * Browser: http://localhost:5000/api/companies?search=Google
 */
export const getCompanies = async ({ search, recruiterEmail, isApproved } = {}) => {
  const url = new URL(`${baseUrl}/api/companies`);
  if (search) url.searchParams.set('search', search);
  if (recruiterEmail) url.searchParams.set('recruiterEmail', recruiterEmail);
  if (isApproved !== undefined) url.searchParams.set('isApproved', String(isApproved));

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch companies');
  }
  return res.json();
};

/**
 * Get the company profile for the currently logged-in recruiter
 * Usage: getMyCompany('recruiter@email.com')
 * Browser: http://localhost:5000/api/companies?recruiterEmail=xxx
 */
export const getMyCompany = async (recruiterEmail) => {
  if (!recruiterEmail) return null;
  const res = await fetch(
    `${baseUrl}/api/companies?recruiterEmail=${encodeURIComponent(recruiterEmail)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.companies?.[0] || null;
};

export const getMyCompanies = async (recruiterEmail) => {
  if (!recruiterEmail) return [];
  const res = await fetch(
    `${baseUrl}/api/companies?recruiterEmail=${encodeURIComponent(recruiterEmail)}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.companies || [];
};

/**
 * Get all jobs posted by a company
 * Usage: getCompanyJobsById('64abc123...', 'active')
 * Browser: http://localhost:5000/api/companies/ID/jobs?status=active
 */
export const getCompanyJobsById = async (companyId, status = 'active') => {
  if (!companyId) throw new Error('companyId is required');
  const url = new URL(`${baseUrl}/api/companies/${companyId}/jobs`);
  if (status && status !== 'all') url.searchParams.set('status', status);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch company jobs');
  }
  return res.json();
};

/**
 * Update company profile fields
 * Usage: updateCompany('64abc123...', { name: 'New Name', industry: 'Tech' })
 */
export const updateCompany = async (id, updates) => {
  const res = await fetch(`${baseUrl}/api/companies/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update company');
  }
  return res.json();
};

/**
 * Admin: Approve or reject a company and optionally set plan
 * Usage: approveCompany('64abc123...', true, 'Growth')
 */
export const approveCompany = async (id, isApproved, plan) => {
  const res = await fetch(`${baseUrl}/api/companies/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isApproved, plan }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update approval status');
  }
  return res.json();
};

/**
 * Delete a company profile
 * Usage: deleteCompany('64abc123...')
 */
export const deleteCompany = async (id) => {
  const res = await fetch(`${baseUrl}/api/companies/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete company');
  }
  return res.json();
};
