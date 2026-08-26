import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
})

let unauthorizedHandler = null
let errorNotifier = null

export function registerApiHandlers({ onUnauthorized, onError } = {}) {
  unauthorizedHandler = onUnauthorized || null
  errorNotifier = onError || null
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      '请求失败，请稍后重试'

    if (status === 401) {
      if (unauthorizedHandler) unauthorizedHandler(error)
      return Promise.reject(error)
    }

    if (errorNotifier) {
      errorNotifier({
        type: 'error',
        message: typeof message === 'string' ? message : '请求失败，请稍后重试',
      })
    }

    return Promise.reject(error)
  },
)

export default api
