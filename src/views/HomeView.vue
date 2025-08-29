<!-- src/views/HomeView.vue -->
<template>
  <div class="container py-4">
    <!-- Encabezado + Sync -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0 text-primary">
        <i class="bi bi-file-medical me-2"></i>
        Resultados de Laboratorio
      </h1>

      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-light text-dark">
          <i class="bi bi-clock-history me-1"></i>
          Última actualización: <strong>{{ lastSync ?? '—' }}</strong>
        </span>

        <button
          class="btn btn-sm btn-outline-success"
          :disabled="importing"
          @click="runImport"
          title="Ejecutar importación de PDFs"
        >
          <span v-if="!importing">
            <i class="bi bi-arrow-repeat me-1"></i> Actualizar índice
          </span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-1" role="status"></span>
            Importando…
          </span>
        </button>
      </div>
    </div>

    <!-- Búsqueda -->
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

    <!-- Loading -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div class="row">
      <!-- Lista -->
      <div class="col-lg-4 mb-4">
        <transition-group name="list-fade" tag="ul" class="list-group overflow-auto" style="max-height:75vh">
          <li
            v-for="pdf in list"
            :key="pdf.id || pdf.path || pdf.url_public || pdf.url_proxy || pdf.url || pdf.name"
            class="list-group-item list-group-item-action d-flex align-items-center"
            @click="selectPdf(pdf)"
            style="cursor:pointer;"
          >
            <i class="bi bi-file-earmark-pdf-fill text-danger fs-4 me-3"></i>
            <div class="flex-grow-1">
              <div class="fw-semibold text-truncate" :title="pdf.name">{{ pdf.name }}</div>
              <small class="text-muted">
                <i class="bi bi-calendar3 me-1"></i>
                {{ pdf.year }}-{{ pad2(pdf.month) }}-{{ pad2(pdf.day) }}
              </small>
            </div>

            <!-- abrir en nueva pestaña con la URL del backend -->
            <a
              v-if="pdf.url_proxy || pdf.url_public || pdf.url"
              :href="pdf.url_proxy || pdf.url_public || pdf.url"
              class="btn btn-sm btn-light ms-2"
              target="_blank"
              @click.stop
              title="Abrir en pestaña nueva"
            >
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
          </li>

          <li v-if="!list.length && !loading" key="no-results" class="list-group-item text-center text-muted">
            <i class="bi bi-exclamation-circle me-1"></i>
            No se encontraron PDFs
          </li>
        </transition-group>

        <!-- Paginación -->
        <nav v-if="meta.last_page > 1" class="mt-3">
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
              <button class="page-link" @click.prevent="fetchPdfs(meta.current_page - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>

            <li v-for="p in pageRange" :key="`p-${p}`" class="page-item" :class="{ active: p === meta.current_page }">
              <button class="page-link" @click.prevent="fetchPdfs(p)">{{ p }}</button>
            </li>

            <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
              <button class="page-link" @click.prevent="fetchPdfs(meta.current_page + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Visor -->
      <div class="col-lg-8" v-if="selectedPdf">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <i class="bi bi-file-earmark-text me-2"></i>{{ selectedPdf.name }}
            </h5>
            <div class="d-flex gap-2">
              <a
                v-if="selectedPdfUrl"
                :href="selectedPdfUrl"
                class="btn btn-outline-primary btn-sm"
                target="_blank"
                title="Abrir en pestaña nueva"
              >
                <i class="bi bi-box-arrow-up-right"></i>
              </a>
              <button class="btn btn-outline-secondary btn-sm" @click="selectedPdf = null" title="Cerrar">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="card-body p-0">
            <iframe
              v-if="selectedPdfUrl"
              :src="selectedPdfUrl"
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
import { usePdfs } from '@/composables/useApi' // asegúrate de que este archivo y export existan

const { pdfs, search, loading, fetchPdfs, lastSync, importing, runImport } = usePdfs()
const selectedPdf = ref(null)

// lista y meta defensivos (evitan "meta undefined")
const list = computed(() => pdfs.value?.data ?? [])
const meta = computed(() => pdfs.value?.meta ?? { current_page: 1, last_page: 1 })

function pad2(n) { return String(n ?? '').padStart(2, '0') }

function selectPdf(pdf) {
  selectedPdf.value = pdf
}

// siempre usa la URL que viene del backend (proxy firmada o pública)
const selectedPdfUrl = computed(() => {
  if (!selectedPdf.value) return ''
  return selectedPdf.value.url_proxy || selectedPdf.value.url_public || selectedPdf.value.url || ''
})

// paginación +/-2 páginas alrededor
const pageRange = computed(() => {
  const total   = meta.value.last_page || 1
  const current = meta.value.current_page || 1
  const delta   = 2
  let start = Math.max(1, current - delta)
  let end   = Math.min(total, current + delta)

  if (current - delta < 1) end = Math.min(total, end + (delta - (current - 1)))
  if (current + delta > total) start = Math.max(1, start - ((current + delta) - total))

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(() => {
  // el composable ya llama fetchPdfs() y last-sync en onMounted,
  // pero si quieres forzar, puedes descomentar:
  // fetchPdfs()
})
</script>

<style scoped>
.list-fade-enter-active,
.list-fade-leave-active { transition: all .3s ease; }
.list-fade-enter-from,
.list-fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
