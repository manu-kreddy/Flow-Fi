import axios from 'axios'

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' }
})

// attach token if present
api.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('token')
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  } catch (e) {
    // ignore in non-browser contexts
  }
  return config
})

export default api
