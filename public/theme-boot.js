(function () {
  try {
    var c = document.cookie || ''
    var modeMatch = c.match(/(?:^|; )impuls_theme=([^;]*)/)
    var mode = modeMatch ? decodeURIComponent(modeMatch[1]) : 'system'
    var resolvedMatch = c.match(/(?:^|; )impuls_theme_resolved=([^;]*)/)
    var resolved = resolvedMatch ? resolvedMatch[1] : ''
    var dark =
      resolved === 'dark' ||
      mode === 'dark' ||
      (mode !== 'light' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    var root = document.documentElement
    root.classList.toggle('dark', !!dark)
    if (!dark) root.classList.remove('dark')
    root.style.colorScheme = dark ? 'dark' : 'light'
    root.dataset.theme = mode || 'system'
  } catch (e) {}
})()
