<template>
  <div class="pdf-page mb-4 d-flex justify-content-center">
    <!-- Spinner centrado -->
    <div v-if="loading" class="spinner-overlay">
      <div class="spinner-border text-secondary spinner-border-sm"></div>
    </div>
    <!-- Canvas donde se renderiza la página -->
    <canvas ref="canvasEl" v-show="rendered"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick, defineEmits } from 'vue'
import { getDocument } from 'pdfjs-dist'

const emit = defineEmits(['error'])
const props = defineProps({
  src:        { type: String, required: true },
  pageNumber: { type: Number, required: true },
  scale:      { type: Number, default: 1.2 }
})

const canvasEl = ref(null)
const loading  = ref(false)
const rendered = ref(false)
let observer

async function renderPage() {
  if (rendered.value) return
  loading.value = true
  try {
    const pdf  = await getDocument(props.src).promise
    const page = await pdf.getPage(props.pageNumber)
    const vp   = page.getViewport({ scale: props.scale })
    const canvas = canvasEl.value
    const ctx    = canvas.getContext('2d')
    canvas.width  = vp.width
    canvas.height = vp.height
    await page.render({ canvasContext: ctx, viewport: vp }).promise
    rendered.value = true
  } catch (err) {
    emit('error', err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Espera el DOM
  await nextTick()
  // Lazy-load con IntersectionObserver
  observer = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          renderPage()
          observer.unobserve(e.target)
        }
      }
    },
    { root: canvasEl.value.parentElement, threshold: 0.1 }
  )
  observer.observe(canvasEl.value)
})

// Re-render al cambiar el zoom
watch(() => props.scale, () => {
  if (rendered.value) {
    rendered.value = false
    renderPage()
  }
})

onBeforeUnmount(() => {
  if (observer && canvasEl.value) observer.unobserve(canvasEl.value)
})
</script>

<style scoped>
.pdf-page {
  position: relative;
}
.spinner-overlay {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
canvas {
  display: block;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
</style>
