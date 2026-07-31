'use server';

import { serverFetch, serverMutation } from "../core/server";

/**
 * Create a new company profile
 */
export const createCompany = async (newCompanyData) => {
  return serverMutation('/api/companies', newCompanyData, 'POST');
};

/**
 * Update an existing company profile
 */
export const updateCompany = async (id, updates) => {
  return serverMutation(`/api/companies/${id}`, updates, 'PATCH');
};

/**
 * Delete a company profile
 */
export const deleteCompany = async (id) => {
  return serverMutation(`/api/companies/${id}`, null, 'DELETE');
};

/**
 * Get all companies for a recruiter
 */
export const getMyCompanies = async (recruiterEmail) => {
  if (!recruiterEmail) return [];
  try {
    const data = await serverFetch(`/api/companies?recruiterEmail=${encodeURIComponent(recruiterEmail)}`);
    return data?.companies || [];
  } catch (e) {
    console.error("getMyCompanies error:", e);
    return [];
  }
};

/**
 * Get single company profile for a recruiter
 */
export const getMyCompany = async (recruiterEmail) => {
  if (!recruiterEmail) return null;
  try {
    const data = await serverFetch(`/api/companies?recruiterEmail=${encodeURIComponent(recruiterEmail)}`);
    return data?.companies?.[0] || null;
  } catch (e) {
    console.error("getMyCompany error:", e);
    return null;
  }
};
