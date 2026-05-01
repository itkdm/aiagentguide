function hasFileExtension(pathname: string) {
  const lastSegment = pathname.split('/').filter(Boolean).pop() ?? ''

  return /\.[a-z0-9]+$/i.test(lastSegment)
}

export function toHtmlPath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  if (hasFileExtension(pathname)) {
    return pathname
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
