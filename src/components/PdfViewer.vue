<template>
  <div class="pdf-viewer border rounded p-2" style="height:80vh; overflow:auto;" ref="container">
    <!-- Controles de Zoom -->
    <div class="d-flex justify-content-end align-items-center mb-2 gap-2">
      <button
        class="btn btn-sm btn-outline-secondary"
        @click="scale = Math.max(0.5, scale - 0.2)"
        :disabled="scale <= 0.6"
      >
        <i class="bi bi-zoom-out"></i>
      </button>
      <span>Zoom {{ Math.round(scale * 100) }}%</span>
      <button class="btn btn-sm btn-outline-secondary" @click="scale += 0.2">
        <i class="bi bi-zoom-in"></i>
      </button>
    </div>

    <!-- Cargando documento -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Lista de páginas -->
    <div v-else>
      <PdfPage
        v-for="n in numPages"
        :key="n"
        :src="src"
        :page-number="n"
        :scale="scale"
        @error="onPageError(n, $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getDocument } from 'pdfjs-dist'
import PdfPage from './PdfPage.vue'

const props = defineProps({
  src: { type: String, required: true }
})

const loading  = ref(true)
const numPages = ref(0)
const scale     = ref(1.2)

async function loadDocument() {
  loading.value = true
  try {
    const pdf = await getDocument(props.src).promise
    numPages.value = pdf.numPages
  } catch (e) {
    console.error('No se pudo cargar el PDF:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadDocument)
watch(() => props.src, loadDocument)

function onPageError(page, err) {
  console.error(`Error en página ${page}:`, err)
}
</script>

<style scoped>
.pdf-viewer {
  position: relative;
}
</style>
