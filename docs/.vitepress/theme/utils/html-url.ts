export function toHtmlPath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  if (pathname.endsWith('.html')) {
    return pathname
  }

  return pathname.endsWith('/') ? `${pathname}index.html` : `${pathname}.html`
}

export function toHtmlAbsoluteUrl(
  origin: string,
  pathname: string,
  search = '',
  hash = ''
) {
  return `${origin}${toHtmlPath(pathname)}${search}${hash}`
}

export function needsHtmlRedirect(pathname: string) {
  return toHtmlPath(pathname) !== pathname
}
