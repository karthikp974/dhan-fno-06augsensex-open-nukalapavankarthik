import { useState } from 'react'
import DhanHeader from './DhanHeader'
import PositionsPage75500 from './PositionsPage75500'
import OrdersPage from './OrdersPage'
import WithdrawPage from './WithdrawPage'
import { LivePnLProvider } from '../hooks/useLivePnL'
import './DhanPositionsReplica.css'

export default function DhanApp() {
  const [activeTab, setActiveTab] = useState('positions')
  const [showWithdraw, setShowWithdraw] = useState(false)

  return (
    <LivePnLProvider>
      <div className="dhan-app">
        {showWithdraw ? (
          <WithdrawPage onBack={() => setShowWithdraw(false)} />
        ) : (
          <>
            <DhanHeader
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onWithdraw={() => setShowWithdraw(true)}
            />

            <div className="dhan-page-content">
              {activeTab === 'positions' ? (
                <PositionsPage75500 />
              ) : (
                <OrdersPage />
              )}
            </div>
          </>
        )}
      </div>
    </LivePnLProvider>
  )
}