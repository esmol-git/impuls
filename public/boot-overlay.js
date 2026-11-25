(function () {
  try {
    if (document.getElementById('site-boot')) return
    var boot = document.createElement('div')
    boot.id = 'site-boot'
    boot.setAttribute('aria-busy', 'true')
    boot.setAttribute('aria-live', 'polite')
    boot.innerHTML =
      '<div id="site-boot__mark">' +
      '<img id="site-boot__logo" src="/img/logo.png" alt="" width="72" height="72" decoding="async">' +
      '<div id="site-boot__bar" aria-hidden="true"><span></span></div>' +
      '</div>'
    // Не в body: Teleport Vue гидратит детей body и ловит mismatch на #site-boot.
    ;(document.documentElement || document.body).appendChild(boot)
  } catch (e) {}
})()
