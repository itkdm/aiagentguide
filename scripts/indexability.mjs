function isImplicitlyIndexableOverviewPage(relativePath) {
  const normalizedPath = String(relativePath || '').replace(/\\/g, '/')

  return normalizedPath === 'index.md' || /^[^/]+\/index\.md$/.test(normalizedPath)
}

export function isIndexablePage({ relativePath = '', frontmatter = {}, isNotFound = false } = {}) {
  if (isNotFound || Boolean(frontmatter.draft || frontmatter.noindex)) {
    return false
  }

  const normalizedStatus = String(frontmatter.status ?? '').trim().toLowerCase()

  if (normalizedStatus) {
    return normalizedStatus === 'published'
  }

  return isImplicitlyIndexableOverviewPage(relativePath)
}
