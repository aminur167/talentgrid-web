'use server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const createJob = async (newJobData) => {
  const res = await fetch(`${baseUrl}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newJobData),
  });

  if (!res.ok) {
    let errorMsg = `Server returned ${res.status}`;
    try {
      const errData = await res.json();
      errorMsg = errData.message || errorMsg;
    } catch {
      // response was not JSON (e.g. HTML error page)
    }
    throw new Error(errorMsg);
  }

  return res.json();
};

export const getJobs = async () => {
  const res = await fetch(`${baseUrl}/api/jobs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  return res.json();
};

export const deleteJob = async (jobId) => {
  const res = await fetch(`${baseUrl}/api/jobs/${jobId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error(`Failed to delete job: ${res.status}`);
  return res.json();
};