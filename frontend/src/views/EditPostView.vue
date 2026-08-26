<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const posts = usePostsStore()
const auth = useAuthStore()

const post = ref(null)
const title = ref('')
const content = ref('')
const loading = ref(false)
const error = ref('')

const canEdit = computed(() => auth.user && post.value && auth.user.id === post.value.user_id)

function resolveDetail(errorObj, fallback = '操作失败，请稍后重试') {
  const detail = errorObj?.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.message || JSON.stringify(item)).join('；')
  }
  return (typeof detail === 'string' && detail) || fallback
}

function handlePageError(errorObj, fallback = '操作失败，请稍后重试') {
  const status = errorObj?.response?.status
  if (status === 401) return
  if (status === 403) {
    error.value = '无权限编辑该文章'
    return
  }
  if (status === 404) {
    error.value = '文章不存在或已删除'
    return
  }
  if (status === 400 || status === 422) {
    error.value = resolveDetail(errorObj, '提交信息有误，请检查后重试')
    return
  }
  error.value = resolveDetail(errorObj, fallback)
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    if (!auth.user) await auth.fetchMe()
    post.value = await posts.getPost(route.params.id)
    if (!canEdit.value) {
      error.value = '无权限编辑该文章'
      return
    }
    title.value = post.value.title
    content.value = post.value.content
  } catch (e) {
    handlePageError(e, '加载失败')
  } finally {
    loading.value = false
  }
})

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await posts.updatePost(route.params.id, { title: title.value, content: content.value })
    router.push(`/posts/${route.params.id}`)
  } catch (e) {
    handlePageError(e, '更新失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="content-section section-pad">
    <h2 style="margin-bottom:1rem;">Update Post</h2>
    <p v-if="loading">Loading...</p>
    <p v-if="error" class="muted">{{ error }}</p>
    <form v-if="!loading && !error && canEdit" class="form-wrap" @submit.prevent="onSubmit">
      <input v-model="title" class="form-control" type="text" required maxlength="100" />
      <textarea v-model="content" class="form-control" rows="10" required></textarea>
      <button class="btn btn-primary" :disabled="loading" type="submit">Update</button>
    </form>
  </section>
</template>
