import { ref } from 'vue'

const STORAGE_KEY = 'impuls_admin_sidebar_mini'

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

const mini = ref(false)
let hydrated = false

function hydrate() {
  if (hydrated || typeof localStorage === 'undefined') return
  mini.value = readStored()
  hydrated = true
}

hydrate()

export function useSidebarMini() {
  function toggle() {
    mini.value = !mini.value
    try {
      localStorage.setItem(STORAGE_KEY, mini.value ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  function setMini(next: boolean) {
    mini.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
  }

  return { mini, toggle, setMini }
}
