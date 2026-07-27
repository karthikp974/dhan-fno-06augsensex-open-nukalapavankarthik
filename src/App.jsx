import { useEffect, useState } from 'react'
import DhanApp from './components/DhanApp'
import PinGate from './components/PinGate'
import { isAllowedEntryPath, normalizeEntryUrl } from './config/appUrl'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const { pathname } = window.location

    if (!isAllowedEntryPath(pathname)) {
      window.location.replace(
        `${window.location.origin}/06aug2026/74400calloption/options/derivatives/nukalapvankarthik/dhanfno.info?aihih=lks`,
      )
      return
    }

    normalizeEntryUrl()
    setReady(true)
  }, [])

  if (!ready) {
    return <div style={{ minHeight: '100vh', background: '#f0f0f0' }} />
  }

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />
  }

  return <DhanApp />
}
