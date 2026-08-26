import { defineStore } from 'pinia'
import api from '../services/api'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    page: 1,
    limit: 5,
    skip: 0,
    hasMore: false,
    total: 0,
    homeRefreshToken: 0,
  }),
  actions: {
    triggerHomeRefresh() {
      this.homeRefreshToken += 1
    },
    async fetchPosts(page = 1, options = {}) {
      const append = Boolean(options.append)
      const skip = (Math.max(1, page) - 1) * this.limit
      const { data } = await api.get('/api/posts', { params: { skip, limit: this.limit } })
      this.posts = append ? [...this.posts, ...data.posts] : data.posts
      this.skip = data.skip
      this.page = Math.floor(data.skip / data.limit) + 1
      this.hasMore = data.has_more
      this.total = data.total
      return data
    },
    async fetchUserPosts(userId, page = 1, options = {}) {
      const append = Boolean(options.append)
      const skip = (Math.max(1, page) - 1) * this.limit
      const { data } = await api.get(`/api/users/${userId}/posts`, { params: { skip, limit: this.limit } })
      this.posts = append ? [...this.posts, ...data.posts] : data.posts
      this.skip = data.skip
      this.page = Math.floor(data.skip / data.limit) + 1
      this.hasMore = data.has_more
      this.total = data.total
      return data
    },
    async getPost(id) {
      const { data } = await api.get(`/api/posts/${id}`)
      return data
    },
    async createPost(payload) {
      const { data } = await api.post('/api/posts', payload)
      return data
    },
    async updatePost(id, payload) {
      const { data } = await api.put(`/api/posts/${id}`, payload)
      return data
    },
    async deletePost(id) {
      await api.delete(`/api/posts/${id}`)
    },
  },
})
