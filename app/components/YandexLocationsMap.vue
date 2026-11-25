<script setup lang="ts">
/**
 * Яндекс.Карта: метка = SVG-пин с мячом.
 * Клик по метке → select(id) для активной карточки.
 * Фокус: pan → zoom → балун (после анимации).
 *
 * Важно: не используем HTML templateLayout — в Chrome ломает drag/scrollZoom.
 */
import { locations, locationBranchHint } from '~/data/locations'
import { preferredAddressText } from '~/utils/locationPayload'
import type { Location } from '~/types'

const props = withDefaults(defineProps<{
  items?: Location[]
  focusId?: string | null
  source?: string
  heightClass?: string
}>(), {
  focusId: null,
  source: 'map',
  heightClass: 'aspect-[16/10] min-h-[280px] sm:min-h-[360px]',
})

const emit = defineEmits<{
  select: [id: string]
}>()

const config = useRuntimeConfig()
const { open: openModal } = useModal()
const apiKey = computed(() => String(config.public.yandexMapsApiKey || '').trim())
const points = computed(() => (props.items?.length ? props.items : locations).filter((l) => l.coords))

const mapEl = ref<HTMLElement | null>(null)
const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
const errorText = ref('')

const PIN_SIZE: [number, number] = [44, 52]
const PIN_OFFSET: [number, number] = [-22, -52]

function pinHref(active: boolean) {
  const origin = import.meta.client ? window.location.origin : ''
  return `${origin}/img/map-pin-ball${active ? '-active' : ''}.svg`
}

type MapEvents = {
  add: (name: string, cb: (e?: { get: (k: string) => unknown }) => void) => { remove: () => void } | void
}

type MapBehaviors = {
  disable: (names: string | string[]) => void
  enable: (names: string | string[]) => void
}

type MapContainer = {
  fitToViewport: () => void
}

type MapLike = {
  geoObjects: { add: (o: unknown) => void }
  setBounds: (b: number[][], opts?: Record<string, unknown>) => void
  setCenter: (c: number[], zoom?: number, opts?: Record<string, unknown>) => void
  setZoom: (zoom: number, opts?: Record<string, unknown>) => void
  getZoom: () => number
  getCenter: () => [number, number]
  destroy: () => void
  events: MapEvents
  behaviors?: MapBehaviors
  container?: MapContainer
}

type PlacemarkLike = {
  balloon: {
    open: () => void
    close: () => void
    isOpen: () => boolean
  }
  options: { set: (k: string, v: unknown) => void }
  properties: { get: (k: string) => unknown }
  events: { add: (name: string, cb: () => void) => void }
}

type YMaps = {
  ready: (cb: () => void) => void
  Map: new (
    el: HTMLElement | string,
    state: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => MapLike
  Placemark: new (
    coords: number[],
    props: Record<string, unknown>,
    opts?: Record<string, unknown>,
  ) => PlacemarkLike
}

declare global {
  interface Window {
    ymaps?: YMaps
  }
}

const TARGET_ZOOM = 13.5
const MID_ZOOM_MIN = 11
const MID_ZOOM_MAX = 12
const NEAR_CENTER_EPS = 0.00035

let mapInstance: MapLike | null = null
let alive = false
const placemarksById = new Map<string, PlacemarkLike>()
let activeMarkId: string | null = null
let suppressSelectEmit = false
let focusSeq = 0
let initGen = 0

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** Только timeout: actionend ловит и user-drag → Continuous ticking / .length */
function waitMs(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function withMapMove(map: MapLike, durationMs: number, run: () => void) {
  try {
    run()
  }
  catch {
    return
  }
  await waitMs(durationMs + 40)
  void map
}

function loadYmaps(key: string): Promise<YMaps> {
  if (window.ymaps) {
    return new Promise((resolve) => {
      window.ymaps!.ready(() => resolve(window.ymaps!))
    })
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-yandex-maps]')
    if (existing) {
      existing.addEventListener('load', () => {
        window.ymaps?.ready(() => resolve(window.ymaps!))
      })
      existing.addEventListener('error', () => reject(new Error('Не удалось загрузить Яндекс.Карты')))
      return
    }

    const script = document.createElement('script')
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`
    script.async = true
    script.dataset.yandexMaps = '1'
    script.onload = () => {
      if (!window.ymaps) {
        reject(new Error('API Яндекс.Карт не инициализировался'))
        return
      }
      window.ymaps.ready(() => resolve(window.ymaps!))
    }
    script.onerror = () => reject(new Error('Не удалось загрузить Яндекс.Карты'))
    document.head.appendChild(script)
  })
}

function pinOptions(active: boolean) {
  return {
    iconLayout: 'default#image',
    iconImageHref: pinHref(active),
    iconImageSize: PIN_SIZE,
    iconImageOffset: PIN_OFFSET,
    openBalloonOnClick: false,
    hideIconOnBalloonOpen: false,
  }
}

function destroyMap() {
  focusSeq += 1
  alive = false
  const map = mapInstance
  mapInstance = null
  placemarksById.clear()
  activeMarkId = null
  suppressSelectEmit = false

  if (!map) return
  try {
    map.destroy()
  }
  catch {
    /* уже уничтожена */
  }
}

function setActivePin(id: string | null) {
  if (!alive) return
  if (activeMarkId && placemarksById.has(activeMarkId) && activeMarkId !== id) {
    placemarksById.get(activeMarkId)!.options.set('iconImageHref', pinHref(false))
    try {
      placemarksById.get(activeMarkId)!.balloon.close()
    }
    catch {
      /* уже закрыт */
    }
  }
  activeMarkId = id
  if (id && placemarksById.has(id)) {
    placemarksById.get(id)!.options.set('iconImageHref', pinHref(true))
  }
}

function notifySelect(id: string) {
  if (suppressSelectEmit) return
  emit('select', id)
}

function isNearCenter(map: MapLike, coords: [number, number]) {
  try {
    const [lat, lon] = map.getCenter()
    return Math.abs(lat - coords[0]) < NEAR_CENTER_EPS
      && Math.abs(lon - coords[1]) < NEAR_CENTER_EPS
  }
  catch {
    return false
  }
}

function isAlreadyFocused(map: MapLike, coords: [number, number]) {
  try {
    return map.getZoom() >= TARGET_ZOOM - 0.15 && isNearCenter(map, coords)
  }
  catch {
    return false
  }
}

function waitForMapSize(el: HTMLElement, gen: number) {
  return new Promise<boolean>((resolve) => {
    const ready = () => el.clientWidth > 0 && el.clientHeight > 0

    if (ready()) {
      resolve(true)
      return
    }

    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      ro.disconnect()
      window.clearTimeout(timer)
      resolve(ok)
    }

    const ro = new ResizeObserver(() => {
      if (gen !== initGen) {
        finish(false)
        return
      }
      if (ready()) finish(true)
    })
    ro.observe(el)

    const timer = window.setTimeout(() => finish(ready()), 2500)
  })
}

async function focusLocation(id: string | null | undefined, fromCard = false) {
  if (!id || !mapInstance || !alive) return
  const loc = points.value.find((p) => p.id === id)
  const mark = placemarksById.get(id)
  if (!loc?.coords || !mark) return

  const seq = ++focusSeq
  if (fromCard) suppressSelectEmit = true

  try {
    setActivePin(id)

    const map = mapInstance
    if (!map || !alive) return

    try {
      map.container?.fitToViewport()
    }
    catch {
      /* ignore */
    }

    if (isAlreadyFocused(map, loc.coords)) {
      try {
        if (!mark.balloon.isOpen()) mark.balloon.open()
      }
      catch {
        /* ignore */
      }
      return
    }

    try {
      mark.balloon.close()
    }
    catch {
      /* balloon мог быть закрыт */
    }

    let currentZoom = 11
    try {
      currentZoom = map.getZoom()
    }
    catch {
      return
    }
    const midZoom = Math.min(Math.max(currentZoom, MID_ZOOM_MIN), MID_ZOOM_MAX)

    await withMapMove(map, 520, () => {
      map.setCenter(loc.coords!, midZoom, {
        duration: 520,
        timingFunction: 'ease-in-out',
      })
    })
    if (seq !== focusSeq || mapInstance !== map || !alive) return

    try {
      if (map.getZoom() < TARGET_ZOOM) {
        await withMapMove(map, 420, () => {
          map.setZoom(TARGET_ZOOM, {
            duration: 420,
            timingFunction: 'ease-out',
          })
        })
        if (seq !== focusSeq || mapInstance !== map || !alive) return
      }
    }
    catch {
      return
    }

    try {
      mark.balloon.open()
    }
    catch {
      /* ignore */
    }
  }
  finally {
    if (seq === focusSeq) suppressSelectEmit = false
  }
}

function openLeadFor(loc: Location) {
  openModal('lead', {
    source: props.source,
    location: preferredAddressText(loc),
  })
}

function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null
  const btn = target?.closest?.('[data-map-lead]') as HTMLElement | null
  if (!btn) return
  e.preventDefault()
  e.stopPropagation()
  const id = btn.getAttribute('data-map-lead')
  const loc = points.value.find((p) => p.id === id)
  if (loc) openLeadFor(loc)
}

function balloonHtml(loc: Location) {
  const address = escapeHtml(loc.address)
  const branch = escapeHtml(locationBranchHint(loc))
  const id = escapeHtml(loc.id)
  /* один balloonContent — header/body у API 2.1 в Chrome дают TypeError .length */
  return {
    balloonContent: `
      <div style="min-width:220px;max-width:280px;padding:2px 4px 4px 0;font-family:Manrope,system-ui,sans-serif">
        <div style="font-weight:700;font-size:16px;line-height:1.25;color:#17233d;padding-right:12px">${address}</div>
        <p style="margin:8px 0 14px;font-weight:500;font-size:13px;line-height:1.4;color:#64748b">${branch}</p>
        <button
          type="button"
          data-map-lead="${id}"
          style="display:inline-flex;align-items:center;justify-content:center;width:100%;min-height:44px;padding:0 16px;border:0;border-radius:12px;background:#B0191B;color:#fff;font-weight:700;font-size:14px;line-height:1;cursor:pointer"
        >Записаться</button>
      </div>
    `,
    hintContent: preferredAddressText(loc),
    locationId: loc.id,
  }
}

function onPlacemarkClick(loc: Location) {
  const same = props.focusId === loc.id
  notifySelect(loc.id)
  if (same) void focusLocation(loc.id, false)
}

function boundsFromPoints(list: Location[]): number[][] | null {
  const withCoords = list.filter((l): l is Location & { coords: [number, number] } => Boolean(l.coords))
  if (!withCoords.length) return null

  let minLat = Infinity
  let maxLat = -Infinity
  let minLon = Infinity
  let maxLon = -Infinity
  for (const loc of withCoords) {
    const [lat, lon] = loc.coords
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLon = Math.min(minLon, lon)
    maxLon = Math.max(maxLon, lon)
  }
  return [
    [minLat, minLon],
    [maxLat, maxLon],
  ]
}

async function initMap() {
  if (!import.meta.client || !mapEl.value) return

  const gen = ++initGen
  destroyMap()

  if (!apiKey.value) {
    status.value = 'error'
    errorText.value = 'Добавьте ключ NUXT_PUBLIC_YANDEX_MAPS_API_KEY в .env'
    return
  }

  if (!points.value.length) {
    status.value = 'error'
    errorText.value = 'Нет площадок с координатами'
    return
  }

  status.value = 'loading'
  errorText.value = ''

  try {
    const sized = await waitForMapSize(mapEl.value, gen)
    if (!sized || gen !== initGen || !mapEl.value) return

    const ymaps = await loadYmaps(apiKey.value)
    if (gen !== initGen || !mapEl.value) return

    mapInstance = new ymaps.Map(mapEl.value, {
      center: [57.626569, 39.893787],
      zoom: 11,
      controls: ['zoomControl', 'fullscreenControl'],
      /* без scrollZoom: колесо = скролл страницы */
      behaviors: ['drag', 'dblClickZoom', 'multiTouch'],
    }, {
      suppressMapOpenBlock: true,
      yandexMapDisablePoiInteractivity: true,
    })
    alive = true

    try {
      mapInstance.container?.fitToViewport()
    }
    catch {
      /* ignore */
    }

    for (const loc of points.value) {
      const mark = new ymaps.Placemark(
        loc.coords!,
        balloonHtml(loc),
        pinOptions(false),
      )
      mark.events.add('click', () => {
        if (!alive) return
        onPlacemarkClick(loc)
      })
      placemarksById.set(loc.id, mark)
      mapInstance.geoObjects.add(mark)
    }

    const bounds = boundsFromPoints(points.value)
    if (bounds) {
      mapInstance.setBounds(bounds, { checkZoomRange: true, zoomMargin: 48 })
    }

    if (gen !== initGen || !alive) return

    status.value = 'ready'

    if (props.focusId) {
      void focusLocation(props.focusId, true)
    }
  }
  catch (err) {
    if (gen !== initGen) return
    destroyMap()
    status.value = 'error'
    errorText.value = err instanceof Error ? err.message : 'Ошибка карты'
  }
}

onMounted(() => {
  void initMap()
  document.addEventListener('click', onDocClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick, true)
  initGen += 1
  destroyMap()
})

watch(apiKey, () => {
  void initMap()
})

watch(() => props.focusId, (id, prev) => {
  if (status.value !== 'ready' || !alive || !id || id === prev) return
  void focusLocation(id, true)
})
</script>

<template>
  <div class="yandex-map relative overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
    <div
      ref="mapEl"
      class="w-full"
      :class="heightClass"
      role="region"
      aria-label="Карта площадок ФК Импульс в Ярославле"
    />

    <div
      v-if="status === 'loading' || status === 'idle'"
      class="pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-50/80"
    >
      <p class="text-sm font-medium text-brand-500">Загружаем карту…</p>
    </div>

    <div
      v-if="status === 'error'"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-50 px-6 text-center"
    >
      <p class="text-sm font-semibold text-brand-700">Карта временно недоступна</p>
      <p class="max-w-md text-xs leading-relaxed text-brand-500">{{ errorText }}</p>
      <a
        class="mt-2 text-sm font-bold text-accent-500 hover:text-accent-600"
        href="https://yandex.ru/maps/?text=Ярославль"
        target="_blank"
        rel="noopener noreferrer"
      >
        Открыть Яндекс.Карты →
      </a>
    </div>
  </div>
</template>
