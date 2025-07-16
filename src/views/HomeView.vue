<!-- src/views/HomeView.vue -->
<template>
  <div class="container py-4">
    <h1 class="mb-4 text-primary">
      <i class="bi bi-file-medical me-2"></i>
      Resultados de Laboratorio
    </h1>

    <!-- Búsqueda por nombre -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="input-group">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Buscar por código o nombre del PDF..."
          />
        </div>
      </div>
    </div>

    <!-- Spinner de carga -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div class="row">
      <!-- Lista de PDFs -->
      <div class="col-lg-4 mb-4">
        <ul class="list-group overflow-auto" style="max-height:75vh">
          <transition-group name="list-fade" tag="div">
            <!-- Cada PDF con key única -->
            <li
              v-for="pdf in pdfs.data"
              :key="pdf.path"
              class="list-group-item list-group-item-action d-flex align-items-center"
              @click="selectPdf(pdf)"
              style="cursor:pointer;"
            >
              <i class="bi bi-file-earmark-pdf-fill text-danger fs-4 me-3"></i>
              <div class="flex-grow-1">
                <div class="fw-semibold">{{ pdf.name }}</div>
                <small class="text-muted">
                  <i class="bi bi-calendar3 me-1"></i>
                  {{ pdf.year }}-{{ String(pdf.month).padStart(2,'0') }}-{{ String(pdf.day).padStart(2,'0') }}
                </small>
              </div>
            </li>

            <!-- Mensaje de "no resultados" también con key -->
            <li
              v-if="!pdfs.data.length && !loading"
              key="no-results"
              class="list-group-item text-center text-muted"
            >
              <i class="bi bi-exclamation-circle me-1"></i>
              No se encontraron PDFs
            </li>
          </transition-group>
        </ul>

        <!-- Paginación -->
        <nav v-if="pdfs.meta.last_page > 1" class="mt-3">
          <ul class="pagination justify-content-center mb-0">
            <li
              class="page-item"
              :class="{ disabled: pdfs.meta.current_page === 1 }"
            >
              <button
                class="page-link"
                @click.prevent="fetchPdfs(pdfs.meta.current_page - 1)"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li
              v-for="p in pageRange"
              :key="p"
              class="page-item"
              :class="{ active: p === pdfs.meta.current_page }"
            >
              <button class="page-link" @click.prevent="fetchPdfs(p)">{{ p }}</button>
            </li>
            <li
              class="page-item"
              :class="{ disabled: pdfs.meta.current_page === pdfs.meta.last_page }"
            >
              <button
                class="page-link"
                @click.prevent="fetchPdfs(pdfs.meta.current_page + 1)"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Visor de PDF -->
      <div class="col-lg-8" v-if="selectedPdf">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-file-earmark-text me-2"></i>{{ selectedPdf.name }}
            </h5>
            <button class="btn btn-outline-secondary btn-sm" @click="selectedPdf = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="card-body p-0">
            <iframe
              :src="selectedPdf.url"
              class="w-100"
              style="height:75vh; border:none;"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePdfs } from '@/composables/useApi'

const { pdfs, search, loading, fetchPdfs } = usePdfs()
const selectedPdf = ref(null)

function selectPdf(pdf) {
  selectedPdf.value = pdf
}

// Paginación +/-2 páginas alrededor de la actual
const pageRange = computed(() => {
  const total   = pdfs.value.meta.last_page || 1
  const current = pdfs.value.meta.current_page || 1
  const delta   = 2
  let start = Math.max(1, current - delta)
  let end   = Math.min(total, current + delta)

  if (current - delta < 1) {
    end = Math.min(total, end + (delta - (current - 1)))
  }
  if (current + delta > total) {
    start = Math.max(1, start - ((current + delta) - total))
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// Primera carga al montar
onMounted(() => {
  fetchPdfs()
})
</script>

<style scoped>
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all .3s ease;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
