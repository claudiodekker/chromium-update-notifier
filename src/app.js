import { createApp as vueCreateApp } from 'vue'
import { store } from '../public/store.js'
import './style.css'

export function createApp(component) {
  const app = vueCreateApp(component)

  app.use({
    install(app) {
      app.config.globalProperties.$store = store
    },
  })

  return app
}
