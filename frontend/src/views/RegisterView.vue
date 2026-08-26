<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const pageError = ref('')
const loading = ref(false)

async function onSubmit() {
  pageError.value = ''
  if (password.value !== confirmPassword.value) {
    pageError.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  try {
    await auth.register({ username: username.value, email: email.value, password: password.value })
    router.push('/login')
  } catch (error) {
    pageError.value = error?.response?.data?.detail || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="content-section section-pad">
    <h2 style="margin-bottom:1rem;">Join Today</h2>
    <form class="form-wrap" @submit.prevent="onSubmit">
      <p v-if="pageError" class="muted">{{ pageError }}</p>
      <input v-model="username" class="form-control" type="text" required placeholder="Username" />
      <input v-model="email" class="form-control" type="email" required placeholder="Email" />
      <input v-model="password" class="form-control" type="password" required placeholder="Password" />
      <input v-model="confirmPassword" class="form-control" type="password" required placeholder="Confirm Password" />
      <button class="btn btn-primary" :disabled="loading" type="submit">{{ loading ? 'Creating...' : 'Sign Up' }}</button>
    </form>
    <p style="margin-top:1rem;" class="muted">
      Already have an account?
      <RouterLink to="/login" style="color:#527c9f;">Sign in</RouterLink>
    </p>
  </section>
</template>
