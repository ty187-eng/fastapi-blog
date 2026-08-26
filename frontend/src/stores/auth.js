import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('access_token') || '',
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    async login({ email, password }) {
      const body = new URLSearchParams()
      body.append('username', email)
      body.append('password', password)

      const { data } = await api.post('/api/users/token', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      this.token = data.access_token
      localStorage.setItem('access_token', this.token)
      await this.fetchMe()
    },
    async register(payload) {
      const { data } = await api.post('/api/users', payload)
      return data
    },
    async fetchMe() {
      if (!this.token) return null
      const { data } = await api.get('/api/users/me')
      this.user = data
      return data
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('access_token')
    },
  },
})
