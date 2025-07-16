// src/composables/useApi.js
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'

export function usePdfs() {
  // Estado
  const pdfs    = ref({ data: [], meta: {} })
  const search  = ref('')
  const loading = ref(false)

  // Crea instancia de Axios apuntando a `/api`
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
  })

  // Función para traer PDFs
  async function fetchPdfs(page = 1) {
    loading.value = true
    try {
      // Nota el slash delante de “pdfs” para asegurar /api/pdfs
      const res = await api.get('/pdfs', {
        params: { search: search.value, page, limit: 20 }
      })
      pdfs.value = { data: res.data.data, meta: res.data.meta }
    } catch (e) {
      console.error('Error al cargar PDFs:', e)
    } finally {
      loading.value = false
    }
  }

  // Debounce para búsqueda más fluida
  const debouncedFetch = debounce(() => fetchPdfs(1), 300)

  // Cada vez que cambie `search`, lanza una nueva consulta debounced
  watch(search, () => debouncedFetch())

  // Al montar el componente, carga la primera página
  onMounted(() => fetchPdfs())

  return { pdfs, search, loading, fetchPdfs }
}
