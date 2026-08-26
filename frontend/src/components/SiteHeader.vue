<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import { usePostsStore } from '../stores/posts'

const auth = useAuthStore()
const ui = useUiStore()
const posts = usePostsStore()
const router = useRouter()

const showCreateModal = ref(false)
const creating = ref(false)
const createError = ref('')
const title = ref('')
const content = ref('')
const isThemeOpen = ref(false)

const currentThemeLabel = computed(() => ui.themeLabel())

function toggleThemeMenu() {
  isThemeOpen.value = !isThemeOpen.value
}

function closeThemeMenu() {
  isThemeOpen.value = false
}

async function goHome() {
  closeThemeMenu()
  showCreateModal.value = false
  posts.triggerHomeRefresh()
  await router.push('/')
}

function selectTheme(theme) {
  ui.setTheme(theme)
  closeThemeMenu()
}

function openCreateModal() {
  createError.value = ''
  title.value = ''
  content.value = ''
  showCreateModal.value = true
  closeThemeMenu()
}

async function onCreateSubmit() {
  creating.value = true
  createError.value = ''
  try {
    const data = await posts.createPost({ title: title.value, content: content.value })
    showCreateModal.value = false
    await router.push(`/posts/${data.id}`)
  } catch (error) {
    createError.value = error?.response?.data?.detail || '创建文章失败'
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <header class="site-header">
    <nav class="navbar navbar-expand-md bg-steel fixed-top" @keydown.esc="closeThemeMenu">
      <div class="container nav-inner">
        <RouterLink class="navbar-brand me-4 brand" to="/">FastAPI Blog</RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          aria-controls="navbarToggle"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="navbarToggle" class="collapse navbar-collapse">
          <div class="navbar-nav me-auto">
            <button class="nav-link active btn btn-link p-0 border-0" type="button" @click="goHome">Home</button>
          </div>

          <div class="navbar-nav">
            <template v-if="auth.isAuthenticated">
              <button class="btn btn-outline-light mb-2 mb-md-0 me-md-2" type="button" @click="openCreateModal">New Post</button>
              <RouterLink class="btn btn-light mb-2 mb-md-0 me-md-3" to="/account">Account</RouterLink>
            </template>
            <template v-else>
              <RouterLink class="btn btn-outline-light mb-2 mb-md-0 me-md-2" to="/login">Login</RouterLink>
              <RouterLink class="btn btn-light mb-2 mb-md-0 me-md-3" to="/register">Register</RouterLink>
            </template>

            <div class="nav-item dropdown theme-dropdown">
              <button class="nav-link dropdown-toggle theme-toggle" type="button" :aria-expanded="isThemeOpen" @click="toggleThemeMenu">
                <span>{{ currentThemeLabel }}</span>
              </button>
              <ul v-if="isThemeOpen" class="dropdown-menu dropdown-menu-end show theme-menu">
                <li><button class="dropdown-item" type="button" @click="selectTheme('light')">🌝 Light</button></li>
                <li><button class="dropdown-item" type="button" @click="selectTheme('dark')">🌚 Dark</button></li>
                <li><button class="dropdown-item" type="button" @click="selectTheme('auto')">🌗 Auto</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="showCreateModal" class="modal-backdrop-custom" @click.self="showCreateModal = false">
      <section class="modal-custom" role="dialog" aria-modal="true" aria-label="Create Post">
        <h3 style="margin-bottom:0.8rem;">Create New Post</h3>
        <p v-if="createError" class="muted" style="margin-bottom:0.8rem;">{{ createError }}</p>
        <form class="form-wrap" @submit.prevent="onCreateSubmit">
          <input v-model="title" class="form-control" type="text" required maxlength="100" placeholder="Title" />
          <textarea v-model="content" class="form-control" rows="8" required placeholder="Content"></textarea>
          <div class="row-actions">
            <button class="btn btn-outline" type="button" @click="showCreateModal = false" :disabled="creating">Cancel</button>
            <button class="btn btn-primary" type="submit" :disabled="creating">{{ creating ? 'Creating...' : 'Create' }}</button>
          </div>
        </form>
      </section>
    </div>
  </header>
</template>
