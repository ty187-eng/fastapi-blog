<script setup>
import { onMounted, ref, watch } from 'vue'
import { usePostsStore } from '../stores/posts'
import PostCard from '../components/PostCard.vue'

const postsStore = usePostsStore()
const loading = ref(false)
const loadingMore = ref(false)
const pageError = ref('')

async function refreshHomePosts() {
  loading.value = true
  pageError.value = ''
  try {
    await postsStore.fetchPosts(1)
  } catch (error) {
    pageError.value = error?.response?.data?.detail || '加载文章失败'
  } finally {
    loading.value = false
  }
}

onMounted(refreshHomePosts)

watch(
  () => postsStore.homeRefreshToken,
  async () => {
    await refreshHomePosts()
  },
)

async function loadMore() {
  if (!postsStore.hasMore || loadingMore.value) return
  loadingMore.value = true
  pageError.value = ''
  try {
    await postsStore.fetchPosts(postsStore.page + 1, { append: true })
  } catch (error) {
    pageError.value = error?.response?.data?.detail || '加载更多失败，请重试'
  } finally {
    loadingMore.value = false
  }
}
</script>

<template>
  <div>
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
