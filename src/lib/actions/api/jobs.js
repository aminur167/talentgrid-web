'use server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

/**
 * Get jobs posted by a specific company/recruiter
 * @param {string} companyId - The company or recruiter identifier
 * @param {string} status - Job status filter: 'active' | 'closed' | 'all'
 */
export const getCompanyJobs = async (companyId, status = 'active') => {
  const url = new URL(`${baseUrl}/api/jobs`);
  if (companyId) url.searchParams.set('companyId', companyId);
  if (status && status !== 'all') url.searchParams.set('status', status);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    let errorMsg = `Server returned ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch {
      // response was not JSON
    }
    throw new Error(errorMsg);
  }

  return response.json();
};