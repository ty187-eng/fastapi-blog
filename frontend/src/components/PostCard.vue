<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { resolveImageUrl } from '../utils/image'

const props = defineProps({
  post: { type: Object, required: true },
  detail: { type: Boolean, default: false },
})

const preview = computed(() => {
  if (props.detail) return props.post.content
  const raw = props.post.content || ''
  return raw.length > 220 ? `${raw.slice(0, 220)}...` : raw
})

const authorAvatarUrl = computed(() => resolveImageUrl(props.post.author?.image_path))
</script>

<template>
  <article class="content-section section-pad article-item">
    <div class="article-header">
      <img class="article-img" :src="authorAvatarUrl" alt="author avatar" />
      <div class="article-meta">
        <div class="article-metadata">
          <RouterLink :to="`/users/${post.user_id}/posts`">{{ post.author?.username || 'Unknown' }}</RouterLink>
          <small>{{ new Date(post.date_posted).toLocaleString() }}</small>
        </div>
        <h2>
          <RouterLink class="article-title" :to="`/posts/${post.id}`">{{ post.title }}</RouterLink>
        </h2>
        <p class="article-content">{{ preview }}</p>
      </div>
    </div>
  </article>
</template>
