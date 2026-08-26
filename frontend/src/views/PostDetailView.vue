<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const router = useRouter()
const posts = usePostsStore()
const auth = useAuthStore()
const ui = useUiStore()

const post = ref(null)
const loading = ref(false)
const error = ref('')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editTitle = ref('')
const editContent = ref('')
const saving = ref(false)
const deleting = ref(false)

const isAuthor = computed(() => auth.user && post.value && auth.user.id === post.value.user_id)

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    post.value = await posts.getPost(route.params.id)
    editTitle.value = post.value.title
    editContent.value = post.value.content
  } catch (e) {
    handlePageError(e, '加载失败')
  } finally {
    loading.value = false
  }
})

function resolveDetail(error, fallback) {
  const detail = error?.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.message || JSON.stringify(item)).join('；')
  }
  return (typeof detail === 'string' && detail) || fallback
}

function handlePageError(errorObj, fallback = '操作失败，请稍后重试') {
  const status = errorObj?.response?.status
  if (status === 401) return
  if (status === 403) {
    error.value = '无权限访问该文章'
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

function openEdit() {
  if (!post.value) return
  editTitle.value = post.value.title
  editContent.value = post.value.content
  error.value = ''
  showEditModal.value = true
}

async function onEditSubmit() {
  if (!post.value) return
  saving.value = true
  error.value = ''
  try {
    const updated = await posts.updatePost(post.value.id, {
      title: editTitle.value,
      content: editContent.value,
    })
    post.value = updated
    showEditModal.value = false
    ui.pushNotification({ type: 'success', message: '文章更新成功' })
  } catch (e) {
    handlePageError(e, '更新失败')
  } finally {
    saving.value = false
  }
}

async function onDelete() {
  if (!post.value) return
  deleting.value = true
  error.value = ''
  try {
    await posts.deletePost(post.value.id)
    showDeleteModal.value = false
    ui.pushNotification({ type: 'success', message: '文章已删除' })
    router.push('/')
  } catch (e) {
    handlePageError(e, '删除失败')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <p v-if="loading">Loading...</p>
    <p v-else-if="error" class="muted">{{ error }}</p>
    <template v-else-if="post">
      <PostCard :post="post" detail />
      <div v-if="isAuthor" class="row-actions" style="margin-top:0.8rem;">
        <button class="btn btn-outline" type="button" @click="openEdit">Edit</button>
        <button class="btn btn-danger" type="button" @click="showDeleteModal = true">Delete</button>
      </div>
    </template>

    <div v-if="showEditModal" class="modal-backdrop-custom" @click.self="showEditModal = false">
      <section class="modal-custom" role="dialog" aria-modal="true" aria-label="Edit Post">
        <h3 style="margin-bottom:0.8rem;">Edit Post</h3>
        <form class="form-wrap" @submit.prevent="onEditSubmit">
          <input v-model="editTitle" class="form-control" type="text" required maxlength="100" />
          <textarea v-model="editContent" class="form-control" rows="8" required></textarea>
          <div class="row-actions">
            <button class="btn btn-outline" type="button" @click="showEditModal = false" :disabled="saving">Cancel</button>
            <button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </section>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop-custom" @click.self="showDeleteModal = false">
      <section class="modal-custom" role="dialog" aria-modal="true" aria-label="Delete Post">
        <h3 style="margin-bottom:0.8rem;">Delete Post?</h3>
        <p class="muted" style="margin-bottom:1rem;">Are you sure you want to delete this post? This action cannot be undone.</p>
        <div class="row-actions">
          <button class="btn btn-outline" type="button" @click="showDeleteModal = false" :disabled="deleting">Cancel</button>
          <button class="btn btn-danger" type="button" @click="onDelete" :disabled="deleting">{{ deleting ? 'Deleting...' : 'Delete' }}</button>
        </div>
      </section>
    </div>
  </div>
</template>
