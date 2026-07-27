/** Canonical entry URL for the app (path + query). */
export const APP_ENTRY_PATH =
  '/06aug2026/74400calloption/options/derivatives/nukalapvankarthik/dhanfno.info'

export const APP_ENTRY_SEARCH = '?aihih=lks'

export const APP_ENTRY_URL = `${APP_ENTRY_PATH}${APP_ENTRY_SEARCH}`

/** Accept root and legacy paths, then normalize to the canonical URL. */
export function isAllowedEntryPath(pathname) {
  return (
    pathname === '/' ||
    pathname === APP_ENTRY_PATH ||
    pathname.startsWith('/06aug2026/74400calloption/')
  )
}

export function normalizeEntryUrl() {
  const { pathname, search } = window.location
  const expected = APP_ENTRY_URL

  if (pathname + search === expected) return

  if (isAllowedEntryPath(pathname)) {
    window.history.replaceState(null, '', expected)
  }
}
