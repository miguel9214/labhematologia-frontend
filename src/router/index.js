// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  // otras rutas: /about, /login, etc.
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
