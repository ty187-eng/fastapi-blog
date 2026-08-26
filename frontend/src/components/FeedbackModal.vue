<script setup>
import { computed } from 'vue'
import { useUiStore } from '../stores/ui'

const ui = useUiStore()
const visible = computed(() => Boolean(ui.feedbackModal))
const title = computed(() => (ui.feedbackModal?.type === 'success' ? 'Success' : 'Error'))
</script>

<template>
  <div v-if="visible" class="modal-backdrop-custom" @click.self="ui.closeFeedbackModal()">
    <section class="modal-custom" role="dialog" aria-modal="true" aria-label="Feedback">
      <h3 style="margin-bottom:0.8rem;">{{ title }}</h3>
      <p>{{ ui.feedbackModal?.message }}</p>
      <div class="row-actions" style="margin-top:1rem; justify-content:flex-end;">
        <button class="btn btn-primary" type="button" @click="ui.closeFeedbackModal()">OK</button>
      </div>
    </section>
  </div>
</template>
