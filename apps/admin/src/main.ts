import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setAuthFailureHandler } from './api/client'
import { router } from './router'
import { setupElementPlus } from './plugins/element-plus'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

const app = createApp(App)
setupElementPlus(app)
const pinia = createPinia()
app.use(pinia)
app.use(router)

setAuthFailureHandler(() => {
  const auth = useAuthStore(pinia)
  auth.clearSession()
  const current = router.currentRoute.value
  if (current.name === 'login') return
  void router.replace({
    name: 'login',
    query: { redirect: current.fullPath },
  })
})

app.mount('#app')
