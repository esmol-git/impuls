(function () {
  try {
    var root = document.documentElement
    // Если SSR уже выставил тему — не перетираем (иначе hydration mismatch).
    var ssrTheme = root.getAttribute('data-theme')
    var ssrScheme = (root.getAttribute('style') || '').indexOf('color-scheme:dark') !== -1
      || root.style.colorScheme === 'dark'
    if (ssrTheme === 'light' || ssrTheme === 'dark') {
      var darkSsr = ssrTheme === 'dark' || ssrScheme
      root.classList.toggle('dark', !!darkSsr)
      if (!darkSsr) root.classList.remove('dark')
      root.style.colorScheme = darkSsr ? 'dark' : 'light'
      return
    }

    var c = document.cookie || ''
    var modeMatch = c.match(/(?:^|; )impuls_theme=([^;]*)/)
    var mode = modeMatch ? decodeURIComponent(modeMatch[1]) : 'system'
    var resolvedMatch = c.match(/(?:^|; )impuls_theme_resolved=([^;]*)/)
    var resolved = resolvedMatch ? resolvedMatch[1] : ''

    var dark =
      mode === 'dark' ||
      (mode !== 'light' && resolved === 'dark')

    root.classList.toggle('dark', !!dark)
    if (!dark) root.classList.remove('dark')
    root.style.colorScheme = dark ? 'dark' : 'light'
    root.dataset.theme = mode || 'system'
  } catch (e) {}
})()
