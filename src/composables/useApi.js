import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import debounce from 'lodash.debounce'

export function usePdfs() {
  const pdfs      = ref({ data: [], meta: { current_page: 1, last_page: 1 } })
  const search    = ref('')
  const loading   = ref(false)

  // NUEVO
  const lastSync  = ref(null)   // "YYYY-MM-DD HH:mm:ss" o null
  const importing = ref(false)

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL // ej: http://192.168.2.93:8001/api
  })

  async function fetchPdfs(page = 1) {
    loading.value = true
    try {
      const res = await api.get('pdf/list', { params: { search: search.value, page, limit: 20 } })
      const meta = res.data?.meta ?? { current_page: page, last_page: page }
      const data = res.data?.data ?? []
      pdfs.value = { data, meta }
    } catch (e) {
      console.error('Error al cargar PDFs:', e)
      pdfs.value = { data: [], meta: { current_page: 1, last_page: 1 } }
    } finally {
      loading.value = false
    }
  }

  // NUEVO: obtener última sync
  async function fetchLastSync() {
    try {
      const { data } = await api.get('pdf/last-sync')
      lastSync.value = data?.last_sync ?? null
    } catch (e) {
      console.error('No se pudo obtener last-sync', e)
      lastSync.value = null
    }
  }

  // NUEVO: disparar import
  async function runImport() {
    if (importing.value) return
    importing.value = true
    try {
      const { data } = await api.post('pdf/import')
      lastSync.value = data?.last_sync ?? null
      // Re-cargar la primera página tras importar
      await fetchPdfs(1)
    } catch (e) {
      console.error('Error al importar PDFs:', e)
    } finally {
      importing.value = false
    }
  }

  const debouncedFetch = debounce(() => fetchPdfs(1), 300)
  watch(search, () => debouncedFetch())

  onMounted(async () => {
    await Promise.all([fetchPdfs(), fetchLastSync()])
  })

  return { pdfs, search, loading, fetchPdfs, lastSync, importing, fetchLastSync, runImport }
}
