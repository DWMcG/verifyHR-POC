// src/components/VerifyNFT.tsx
import React, { useState } from 'react'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useSnackbar } from 'notistack'
import VerifyEmploymentModal from './VerifyEmploymentModal'
import VerifyEducationModal from './VerifyEducationModal'


// ✅ Shared props for VerifyNFT
interface VerifyNFTProps {
  openModal: boolean
  setModalState: (open: boolean) => void
}

// ✅ Employment credential structure (curated fields only)
export interface EmploymentCredential {
  company: string
  role: string
  startDate: string
  endDate?: string
  image?: string
}

// ✅ Education credential structure (curated fields only)
export interface EducationCredential {
  institution: string
  degree: string
  major: string
  startDate: string
  endDate?: string
  image?: string
}

const VerifyNFT: React.FC<VerifyNFTProps> = ({ openModal, setModalState }) => {
  const [assetId, setAssetId] = useState('')
  const { enqueueSnackbar } = useSnackbar()

  const [employmentCredential, setEmploymentCredential] = useState<EmploymentCredential | null>(null)
  const [educationCredential, setEducationCredential] = useState<EducationCredential | null>(null)
  const [showEmploymentModal, setShowEmploymentModal] = useState(false)
  const [showEducationModal, setShowEducationModal] = useState(false)

  const handleVerify = async () => {
  try {
    const algorand = AlgorandClient.testNet() // Or mainNet() later
    const assetInfo = await algorand.client.algod.getAssetByID(Number(assetId)).do()

    enqueueSnackbar(`✅ Asset exists! Asset Name: ${assetInfo.params.name}`, { variant: 'success' })

    const url = assetInfo.params.url as string | undefined
    if (url && url.startsWith('ipfs://')) {
      const cid = url.replace('ipfs://', '')
      const gatewayUrl = `https://ipfs.io/ipfs/${cid}`

      const res = await fetch(gatewayUrl)
      if (!res.ok) throw new Error('Failed to fetch credential metadata from IPFS')

      const credential = await res.json()

      if (credential.type === 'employment') {
        const curated: EmploymentCredential = {
          company: credential.company,
          role: credential.role,
          startDate: credential.startDate,
          endDate: credential.endDate,
          image: credential.image 
            ? credential.image.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${credential.image.slice(7)}` 
              : credential.image
            : undefined
        }

        setEmploymentCredential(curated)
        setShowEmploymentModal(true)
      } else if (credential.type === 'education') {
        const curated: EducationCredential = {
          institution: credential.institution,
          degree: credential.degree,
          major: credential.major,
          startDate: credential.startDate,
          endDate: credential.endDate,
          image: credential.image 
            ? credential.image.startsWith('ipfs://') 
              ? `https://ipfs.io/ipfs/${credential.image.slice(7)}` 
              : credential.image
            : undefined
        }
        setEducationCredential(curated)
        setShowEducationModal(true)
      }
    }

    // ✅ Clear input after successful verification modal is triggered
    setAssetId('')

  } catch (err) {
    console.error(err)
    enqueueSnackbar('❌ Asset not found or invalid ID', { variant: 'error' })
  }
}

  if (!openModal) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Verify Credential</h2>
        <input
          type="text"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          placeholder="Enter Asset ID"
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setModalState(false)}
            className="px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            className="px-4 py-2 rounded-lg bg-green-600 text-white"
          >
            Verify
          </button>
        </div>
      </div>
        <VerifyEmploymentModal
          open={showEmploymentModal}
          credential={employmentCredential}
          onClose={() => setShowEmploymentModal(false)}
        />

        <VerifyEducationModal
          open={showEducationModal}
          credential={educationCredential}
          onClose={() => setShowEducationModal(false)}
        />
    </div>
  )
}

export default VerifyNFT
