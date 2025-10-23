// src/components/NFTmint.tsx
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect, useRef } from 'react'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface NFTMintProps {
  openModal: boolean
  setModalState: (value: boolean) => void
  credentialJSON?: any
}

const NFTmint = ({ openModal, setModalState, credentialJSON }: NFTMintProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [asaId, setAsaId] = useState<string | null>(null)

  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const hasMinted = useRef(false)
  const prevCredentialRef = useRef<any>(null)

  useEffect(() => {
    // Reset hasMinted when a new credential object is passed
    if (credentialJSON !== prevCredentialRef.current) {
      hasMinted.current = false
      prevCredentialRef.current = credentialJSON
    }

    const mintAutomatically = async () => {
      if (!credentialJSON?.metadataUrl || !activeAddress || !transactionSigner) return
      if (hasMinted.current) return
      hasMinted.current = true

      setLoading(true)
      setAsaId(null)

      try {
        enqueueSnackbar('Minting NFT automatically...', { variant: 'info' })

        const metadataUrl = credentialJSON.metadataUrl
        const hashHex = credentialJSON.hashHex
        const metadataHash = new Uint8Array(
          hashHex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16))
        )

        const createNFTResult = await algorand.send.assetCreate({
          sender: activeAddress,
          signer: transactionSigner,
          total: 1n,
          decimals: 0,
          assetName: 'Employment Credential',
          unitName: 'vHR',
          url: metadataUrl,
          metadataHash,
          defaultFrozen: false,
        })

        enqueueSnackbar(`✅ NFT Minted! ASA ID: ${createNFTResult.assetId}`, { variant: 'success' })
        setAsaId(createNFTResult.assetId.toString())
        // Atomatic creator wallet opt-in
        try {
          await algorand.send.assetOptIn({
            sender:activeAddress,
            signer: transactionSigner,
            assetId: createNFTResult.assetId,
          })
          enqueueSnackbar ('Creator wallet opted-in automatically', {variant: 'info' })
        } catch (optInError) {
          console.warn(' Automatic opt-in failed:', optInError)
        }

      } catch (e) {
        console.error(e)
        enqueueSnackbar('❌ Failed to mint NFT', { variant: 'error' })
      }

      setLoading(false)
      setModalState(false)
    }

    mintAutomatically()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [credentialJSON, activeAddress, transactionSigner])

  return null
}

export default NFTmint
