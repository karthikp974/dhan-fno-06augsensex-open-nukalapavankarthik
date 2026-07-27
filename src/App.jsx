import { useState } from 'react'
import DhanApp from './components/DhanApp'
import PinGate from './components/PinGate'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />
  }

  return <DhanApp />
}
