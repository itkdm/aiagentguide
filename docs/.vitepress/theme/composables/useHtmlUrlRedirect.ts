import { onMounted } from 'vue'

import { needsHtmlRedirect, toHtmlAbsoluteUrl } from '../utils/html-url'

export function useHtmlUrlRedirect() {
  onMounted(() => {
    if (!needsHtmlRedirect(window.location.pathname)) {
      return
    }

    window.location.replace(
      toHtmlAbsoluteUrl(
        window.location.origin,
        window.location.pathname,
        window.location.search,
        window.location.hash
      )
    )
  })
}
