<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePostsStore } from '../stores/posts'
import api from '../services/api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const postsStore = usePostsStore()

const user = ref(null)
const loading = ref(false)
const loadingMore = ref(false)
const pageError = ref('')

onMounted(async () => {
  loading.value = true
  pageError.value = ''
  try {
    const id = route.params.userId
    const { data } = await api.get(`/api/users/${id}`)
    user.value = data
    await postsStore.fetchUserPosts(id, 1)
  } catch (error) {
    const status = error?.response?.status
    if (status === 401) return
    if (status === 403) {
      pageError.value = '无权限查看该用户帖子'
      return
    }
    if (status === 404) {
      pageError.value = '用户不存在'
      return
    }
    pageError.value = error?.response?.data?.detail || '加载用户帖子失败'
  } finally {
    loading.value = false
  }
})

async function loadMore() {
  if (loadingMore.value || !postsStore.hasMore) return
  loadingMore.value = true
  pageError.value = ''
  const id = route.params.userId
  try {
    await postsStore.fetchUserPosts(id, postsStore.page + 1, { append: true })
  } catch (error) {
    const status = error?.response?.status
    if (status === 401) return
    if (status === 403) {
      pageError.value = '无权限查看更多帖子'
      return
    }
    if (status === 404) {
      pageError.value = '用户或帖子不存在'
      return
    }
    pageError.value = error?.response?.data?.detail || '加载更多失败，请重试'
  } finally {
    loadingMore.value = false
  }
}
</script>

<template>
  <div>
    <section class="content-section section-pad" style="margin-bottom:1rem;">
      <h2>Posts by {{ user?.username || 'User' }} ({{ postsStore.total || postsStore.posts.length }})</h2>
    </section>
    <p v-if="loading">Loading...</p>
    <p v-else-if="pageError && !postsStore.posts.length" class="muted">{{ pageError }}</p>
    <PostCard v-for="post in postsStore.posts" :key="post.id" :post="post" />
    <p v-if="pageError && postsStore.posts.length" class="muted" style="margin-top:0.8rem;">{{ pageError }}</p>
    <div class="pagination" v-if="postsStore.hasMore || loadingMore">
      <button class="btn btn-outline" :disabled="loadingMore" @click="loadMore">
        {{ loadingMore ? 'Loading...' : 'Load More' }}
      </button>
    </div>
  </div>
</template>
