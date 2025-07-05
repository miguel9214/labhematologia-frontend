// src/main.js
import { createApp } from 'vue'
import App          from './App.vue'
import router       from './router'

// estilos globales
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
const app = createApp(App)

// monta el router
app.use(router)

// y finalmente monta la aplicación
app.mount('#app')
