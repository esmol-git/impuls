import type { App } from 'vue'
import ElementPlus from 'element-plus'
import ru from 'element-plus/es/locale/lang/ru'
import 'element-plus/dist/index.css'

export function setupElementPlus(app: App) {
  app.use(ElementPlus, { locale: ru, size: 'default' })
}
