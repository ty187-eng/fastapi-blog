<script setup>
import { useUiStore } from '../stores/ui'

const ui = useUiStore()

function bg(type) {
  if (type === 'success') return '#0a7c2f'
  if (type === 'warning') return '#9a6700'
  return '#b00020'
}
</script>

<template>
  <div class="notice-stack">
    <div v-for="item in ui.notifications" :key="item.id" class="notice" :style="{ background: bg(item.type) }">
      <div class="notice-head">
        <span>{{ item.message }}</span>
        <button class="notice-close" @click="ui.removeNotification(item.id)">✕</button>
      </div>
    </div>
  </div>
</template>
