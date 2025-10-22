// src/components/Home.tsx
import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openPaymentModal, setOpenPaymentModal] = useState(false)
  const [openMintModal, setOpenMintModal] = useState(false)
  const [openTokenModal, setOpenTokenModal] = useState(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-300 to-emerald-400 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Welcome to MasterPass
        </h1>
        <p className="text-gray-600 mb-6">
          Your ticket to join the next-gen Web3 event. Connect, explore, and get inspired!
        </p>

        <div className="flex flex-col gap-4">
          <button
            className="btn btn-primary"
            onClick={() => setOpenWalletModal(true)}
          >
            Connect Wallet
          </button>

          {activeAddress && (
            <>
              <button
                className="btn btn-accent"
                onClick={() => setOpenPaymentModal(true)}
              >
                Send Payment
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setOpenMintModal(true)}
              >
                Mint MasterPass NFT
              </button>

              <button
                className="btn btn-info"
                onClick={() => setOpenTokenModal(true)}
              >
                Create Token (ASA)
              </button>
            </>
          )}
        </div>

        {/* Modals */}
        <ConnectWallet
          openModal={openWalletModal}
          closeModal={() => setOpenWalletModal(false)}
        />
        <Transact
          openModal={openPaymentModal}
          setModalState={setOpenPaymentModal}
        />
        <NFTmint
          openModal={openMintModal}
          setModalState={setOpenMintModal}
        />
        <Tokenmint
          openModal={openTokenModal}
          setModalState={setOpenTokenModal}
        />
      </div>
    </div>
  )
}

export default Home
