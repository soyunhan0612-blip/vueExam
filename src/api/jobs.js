import http from './http.js'

export async function fetchJobs({ q, region } = {}, { signal } = {}) {
  const params = {
    _sort: 'postedAt',
    _order: 'desc',
  }

  if (q) params.q = q
  if (region) params.region = region

  const response = await http.get('/jobs', { params, signal })
  return response.data
}

export async function fetchJobsByIds(ids, { signal } = {}) {
  if (!ids.length) return []

  const response = await http.get('/jobs', {
    params: { id: ids },
    signal,
  })
  return response.data
}

export async function fetchJob(id, { signal } = {}) {
  const response = await http.get(`/jobs/${encodeURIComponent(id)}`, { signal })
  return response.data
}

export async function createApplication(payload) {
  const response = await http.post('/applications', {
    ...payload,
    createdAt: new Date().toISOString(),
  })
  return response.data
}
