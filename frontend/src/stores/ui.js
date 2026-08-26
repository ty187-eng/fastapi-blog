import { defineStore } from 'pinia'

const STORAGE_KEY = 'fastapi_blog_theme'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

const THEME_LABELS = {
  light: '🌝 Light',
  dark: '🌚 Dark',
  auto: '🌗 Auto',
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'auto',
    resolvedTheme: 'dark',
    notifications: [],
    notificationCounter: 0,
    feedbackModalVisible: false,
    feedbackModalTitle: '',
    feedbackModalMessage: '',
    feedbackModalVariant: 'success',
    feedbackModalRedirectTo: null,
  }),
  actions: {
    initializeTheme() {
      const savedTheme = localStorage.getItem(STORAGE_KEY)
      const normalized = ['light', 'dark', 'auto'].includes(savedTheme) ? savedTheme : 'auto'
      this.theme = normalized
      this.applyTheme(normalized)
      this.bindThemeWatcher()
    },
    setTheme(theme) {
      const normalized = ['light', 'dark', 'auto'].includes(theme) ? theme : 'auto'
      this.theme = normalized
      localStorage.setItem(STORAGE_KEY, normalized)
      this.applyTheme(normalized)
    },
    bindThemeWatcher() {
      const media = window.matchMedia(MEDIA_QUERY)
      if (this._onThemeMediaChange) {
        media.removeEventListener('change', this._onThemeMediaChange)
      }
      this._onThemeMediaChange = () => {
        if (this.theme === 'auto') {
          this.applyTheme('auto')
        }
      }
      media.addEventListener('change', this._onThemeMediaChange)
    },
    applyTheme(theme) {
      const resolved =
        theme === 'auto' ? (window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light') : theme
      this.resolvedTheme = resolved
      document.documentElement.setAttribute('data-theme', resolved)
    },
    themeLabel(theme = this.theme) {
      return THEME_LABELS[theme] || THEME_LABELS.auto
    },
    pushNotification(notification) {
      const id = ++this.notificationCounter
      this.notifications.push({
        id,
        type: notification.type || 'info',
        message: notification.message || '',
        timeout: notification.timeout ?? 3000,
      })
      const timeout = notification.timeout ?? 3000
      if (timeout > 0) {
        setTimeout(() => this.removeNotification(id), timeout)
      }
    },
    removeNotification(id) {
      this.notifications = this.notifications.filter((item) => item.id !== id)
    },
    showFeedbackModal(payload) {
      this.feedbackModalTitle = payload.title || (payload.variant === 'error' ? 'Error' : 'Success')
      this.feedbackModalMessage = payload.message || ''
      this.feedbackModalVariant = payload.variant || 'success'
      this.feedbackModalRedirectTo = payload.redirectTo || null
      this.feedbackModalVisible = true
    },
    closeFeedbackModal() {
      this.feedbackModalVisible = false
    },
  },
})
