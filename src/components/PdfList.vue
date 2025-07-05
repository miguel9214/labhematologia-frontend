<!-- src/components/PdfList.vue -->
<template>
  <div>
    <ul
      class="list-group overflow-auto"
      style="max-height: 70vh;"
      role="list"
      aria-label="Lista de PDFs"
    >
      <transition-group name="list-fade" tag="div">
        <li
          v-for="pdf in pdfs"
          :key="pdf.path"
          class="list-group-item list-group-item-action d-flex align-items-start"
          :class="{ active: pdf.path === selectedPath }"
          role="listitem"
          @click="$emit('select', pdf)"
        >
          <i
            class="bi bi-file-earmark-pdf-fill fs-4 flex-shrink-0 me-3"
            :class="pdf.path === selectedPath ? 'text-white' : 'text-danger'"
            aria-hidden="true"
          ></i>
          <div class="w-100">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-semibold text-truncate" style="max-width: 70%">
                {{ pdf.name }}
              </span>
              <small class="text-muted ms-2">
                <i class="bi bi-calendar3 me-1"></i>
                {{ pdf.year }}-{{ String(pdf.month).padStart(2,'0') }}-{{ String(pdf.day).padStart(2,'0') }}
              </small>
            </div>
          </div>
        </li>
      </transition-group>
      <li
        v-if="!pdfs.length"
        class="list-group-item text-center text-muted"
        role="note"
      >
        <i class="bi bi-exclamation-circle me-1"></i>No hay PDFs
      </li>
    </ul>

    <!-- Paginación mejorada -->
    <nav v-if="meta.last_page > 1" class="mt-2" aria-label="Paginación de PDFs">
      <ul class="pagination justify-content-center mb-0">
        <li class="page-item" :class="{ disabled: meta.current_page === 1 }">
          <button class="page-link" @click="$emit('page', meta.current_page - 1)" aria-label="Anterior">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
          </button>
        </li>

        <!-- Páginas con el "rango deslizante" -->
        <li
          v-for="p in pageRange"
          :key="p"
          class="page-item"
          :class="{ active: p === meta.current_page }"
        >
          <button class="page-link" @click="$emit('page', p)">
            {{ p }}
          </button>
        </li>

        <li class="page-item" :class="{ disabled: meta.current_page === meta.last_page }">
          <button class="page-link" @click="$emit('page', meta.current_page + 1)" aria-label="Siguiente">
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  pdfs:       { type: Array, required: true },
  meta:       { type: Object, required: true },
  selectedPath: { type: String, default: null }
})

// Calcula un rango deslizante de hasta 5 páginas
const pageRange = computed(() => {
  const total = props.meta.last_page
  const current = props.meta.current_page
  const delta = 2 // dos antes y dos después
  let start = Math.max(1, current - delta)
  let end   = Math.min(total, current + delta)

  // Ajusta si estamos cerca del borde
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
</script>

<style scoped>
.list-group-item {
  transition: background-color .2s;
}
.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all .3s ease;
}
.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
