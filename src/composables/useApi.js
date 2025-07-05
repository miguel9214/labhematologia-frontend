import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'

export function usePdfs() {
  const pdfs    = ref({ data: [], meta: {} })
  const filters = ref({ year:'', month:'', day:'', search:'' })
  const loading = ref(false)

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
  })

  async function fetchPdfs(page = 1) {
    loading.value = true
    try {
      const res = await api.get('pdfs', {
        params: { ...filters.value, page, limit: 20 }
      })
      pdfs.value = { data: res.data.data, meta: res.data.meta }
    } catch (e) {
      console.error('Error al cargar PDFs:', e)
    } finally {
      loading.value = false
    }
  }

  // Debounce para búsqueda mas fluida
  const debouncedFetch = debounce(fetchPdfs, 300)

  // Reactivo a search únicamente
  watch(() => filters.value.search, () => debouncedFetch(1))

  // También a año/mes/día
  watch([() => filters.value.year, () => filters.value.month, () => filters.value.day],
        () => fetchPdfs(1))

  onMounted(() => fetchPdfs())

  return { pdfs, filters, loading, fetchPdfs }
}
