<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'

const router = useRouter()
const posts = usePostsStore()
const title = ref('')
const content = ref('')
const loading = ref(false)
const error = ref('')

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    const post = await posts.createPost({ title: title.value, content: content.value })
    router.push(`/posts/${post.id}`)
  } catch (e) {
    error.value = e?.response?.data?.detail || '创建失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="content-section section-pad">
    <h2 style="margin-bottom:1rem;">New Post</h2>
    <form class="form-wrap" @submit.prevent="onSubmit">
      <input v-model="title" class="form-control" type="text" placeholder="Title" required maxlength="100" />
      <textarea v-model="content" class="form-control" rows="10" placeholder="Content" required></textarea>
      <button class="btn btn-primary" :disabled="loading" type="submit">{{ loading ? 'Publishing...' : 'Post' }}</button>
      <p v-if="error" class="muted">{{ error }}</p>
    </form>
  </section>
</template>
