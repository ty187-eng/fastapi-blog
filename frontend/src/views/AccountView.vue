<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { useUiStore } from '../stores/ui'
import { resolveImageUrl } from '../utils/image'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const username = ref(auth.user?.username || '')
const email = ref(auth.user?.email || '')
const loading = ref(false)
const deleting = ref(false)
const pageError = ref('')
const avatarFile = ref(null)
const avatarPreview = ref('')
const uploadingAvatar = ref(false)

const avatarUrl = computed(() => resolveImageUrl(auth.user?.image_path))
const displayAvatarUrl = computed(() => avatarPreview.value || avatarUrl.value)
const canUploadAvatar = computed(() => Boolean(avatarFile.value) && !uploadingAvatar.value)

function resolveErrorMessage(error, fallback = '操作失败，请稍后重试') {
  const detail = error?.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || JSON.stringify(item))
      .join('；')
  }
  return (typeof detail === 'string' && detail) || fallback
}

function handlePageError(error, fallback = '操作失败，请稍后重试') {
  const status = error?.response?.status
  if (status === 401) return
  if (status === 403) {
    pageError.value = '无权限执行该操作'
    return
  }
  if (status === 404) {
    pageError.value = '用户不存在或已被删除'
    return
  }
  if (status === 400 || status === 422) {
    pageError.value = resolveErrorMessage(error, '提交信息有误，请检查后重试')
    return
  }
  pageError.value = resolveErrorMessage(error, fallback)
}

watch(
  () => auth.user,
  (u) => {
    username.value = u?.username || ''
    email.value = u?.email || ''
  },
  { immediate: true }
)

async function onSave() {
  loading.value = true
  pageError.value = ''
  try {
    const { data } = await api.patch(`/api/users/${auth.user.id}`, {
      username: username.value,
      email: email.value,
    })
    auth.user = data
    ui.pushNotification({ type: 'success', message: '账户资料更新成功' })
  } catch (error) {
    handlePageError(error, '账户资料更新失败')
  } finally {
    loading.value = false
  }
}

function onAvatarChange(event) {
  const file = event.target.files?.[0]
  revokeAvatarPreview()
  avatarFile.value = file || null
  avatarPreview.value = file ? URL.createObjectURL(file) : ''
}

async function onAvatarUpload() {
  if (!avatarFile.value) return
  pageError.value = ''
  const form = new FormData()
  form.append('file', avatarFile.value)
  uploadingAvatar.value = true
  try {
    const { data } = await api.patch(`/api/users/${auth.user.id}/picture`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    auth.user = data
    avatarFile.value = null
    revokeAvatarPreview()
    ui.pushNotification({ type: 'success', message: '头像上传成功' })
  } catch (error) {
    handlePageError(error, '头像上传失败')
  } finally {
    uploadingAvatar.value = false
  }
}

onBeforeUnmount(() => {
  revokeAvatarPreview()
})

async function onAvatarDelete() {
  pageError.value = ''
  try {
    const { data } = await api.delete(`/api/users/${auth.user.id}/picture`)
    auth.user = data
    ui.pushNotification({ type: 'success', message: '头像已删除' })
  } catch (error) {
    handlePageError(error, '头像删除失败')
  }
}

async function onDeleteAccount() {
  if (!confirm('确认永久删除账户？该操作不可恢复。')) return
  deleting.value = true
  pageError.value = ''
  try {
    await api.delete(`/api/users/${auth.user.id}`)
    auth.logout()
    ui.pushNotification({ type: 'success', message: '账户删除成功' })
    await router.push('/')
  } catch (error) {
    handlePageError(error, '账户删除失败')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <section class="content-section section-pad">
    <h2 style="margin-bottom:1rem;">Account Info</h2>
    <p v-if="pageError" class="muted" style="margin-bottom:1rem;">{{ pageError }}</p>
    <div class="account-box">
      <img class="account-img" :src="displayAvatarUrl" alt="avatar" />
      <label style="display:grid; gap:0.45rem;">
        <span class="muted">Update Profile Picture</span>
        <input class="form-control" style="max-width:320px;" type="file" accept="image/*" @change="onAvatarChange" />
      </label>
      <button class="btn btn-primary" style="max-width:320px;" type="button" :disabled="!canUploadAvatar" @click="onAvatarUpload">
        {{ uploadingAvatar ? 'Uploading...' : 'Upload' }}
      </button>
      <button class="btn btn-outline" style="max-width:320px;" type="button" @click="onAvatarDelete">Delete Profile Picture</button>
    </div>

    <form class="form-wrap" @submit.prevent="onSave">
      <input v-model="username" class="form-control" type="text" required placeholder="Username" />
      <input v-model="email" class="form-control" type="email" required placeholder="Email" />
      <button class="btn btn-primary" :disabled="loading" type="submit">{{ loading ? 'Saving...' : 'Update' }}</button>
      <button class="btn btn-outline" type="button" @click="auth.logout(); router.push('/');">Logout</button>
      <button class="btn btn-danger" :disabled="deleting" type="button" @click="onDeleteAccount">{{ deleting ? 'Deleting...' : 'Delete Account' }}</button>
    </form>
  </section>
</template>
function revokeAvatarPreview() {
  if (avatarPreview.value && avatarPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(avatarPreview.value)
  }
  avatarPreview.value = ''
}
