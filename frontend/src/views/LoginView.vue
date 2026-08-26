<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await auth.login({ email: email.value, password: password.value })
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="content-section section-pad">
    <h2 style="margin-bottom:1rem;">Log In</h2>
    <form class="form-wrap" @submit.prevent="onSubmit">
      <input v-model="email" class="form-control" type="email" required placeholder="Email" />
      <input v-model="password" class="form-control" type="password" required placeholder="Password" />
      <button class="btn btn-primary" :disabled="loading" type="submit">{{ loading ? 'Logging in...' : 'Login' }}</button>
    </form>
    <p style="margin-top:1rem;" class="muted">
      Need an account?
      <RouterLink to="/register" style="color:#527c9f;">Sign up now</RouterLink>
    </p>
  </section>
</template>
