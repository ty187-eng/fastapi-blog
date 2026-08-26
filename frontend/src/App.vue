<script setup>
import { computed, onMounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useUiStore } from './stores/ui'
import { registerApiHandlers } from './services/api'
import NotificationList from './components/NotificationList.vue'
import FeedbackModal from './components/FeedbackModal.vue'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()
const routerViewKey = computed(() => route.fullPath)

onMounted(async () => {
  registerApiHandlers({
    onUnauthorized: () => {
      const current = router.currentRoute.value
      auth.logout()
      if (current.path !== '/login') {
        router.push({ path: '/login', query: { next: current.fullPath } })
      }
    },
    onError: ({ type, message }) => {
      ui.pushNotification({ type, message })
    },
  })

  ui.initializeTheme()
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
    }
  }
})
</script>

<template>
  <div class="app-shell">
    <SiteHeader />
    <NotificationList />
    <FeedbackModal />
    <main class="main-wrap">
      <RouterView :key="routerViewKey" />
    </main>
    <SiteFooter />
  </div>
</template>
