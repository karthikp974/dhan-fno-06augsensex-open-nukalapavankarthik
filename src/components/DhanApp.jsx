import { useState } from 'react'
import DhanHeader from './DhanHeader'
import PositionsPage from './PositionsPage'
import OrdersPage from './OrdersPage'
import { LivePnLProvider } from '../hooks/useLivePnL'
import './DhanPositionsReplica.css'

export default function DhanApp() {
  const [activeTab, setActiveTab] = useState('positions')

  return (
    <LivePnLProvider>
      <div className="dhan-app">
        <DhanHeader activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="dhan-page-content">
          {activeTab === 'positions' ? <PositionsPage /> : <OrdersPage />}
        </div>
      </div>
    </LivePnLProvider>
  )
}
