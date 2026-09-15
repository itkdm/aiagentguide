export const contentAccessConfig = {
  enabled: true,
  version: 1,
  codeHash: '94edf28c6d6da38fd35d7ad53e485307f89fbeaf120485c8d17a43f323deee71',
  wechatName: '布吉岛 Agent',
  keyword: '验证码',
  qrCodeSrc: 'https://oss.aiagentguide.cn/shared/codex-clipboard-e7152a3a-07ca-4e8f-9e38-a8ef3dec0b07.jpg'
} as const

const storageKey = 'bujidao-content-access'

type StoredAccess = {
  verified: boolean
  version: number
}

export function readContentAccess() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null') as Partial<StoredAccess> | null
    return stored?.verified === true && stored.version === contentAccessConfig.version
  } catch {
    return false
  }
}

export function saveContentAccess() {
  if (typeof window === 'undefined') {
    return
  }

  const value: StoredAccess = { verified: true, version: contentAccessConfig.version }
  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

export async function verifyContentAccessCode(code: string) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return false
  }

  const data = new TextEncoder().encode(code.trim())
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')

  return hash === contentAccessConfig.codeHash
}
