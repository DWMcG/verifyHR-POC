import React, { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import ConnectWallet from './components/ConnectWallet'
import Transact from './components/Transact'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'
import EmploymentForm from './components/credentials/EmploymentForm'
import EducationForm from './components/credentials/EducationForm'
import VerifyNFT from './components/VerifyNFT'
import VerifyIDManager from './components/VerifyIDManager'
import { dummyCandidates } from './data/dummyCandidates'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [assetIdInput, setAssetIdInput] = useState('')   // 🟢 store the value of the assetID input
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null) // 🟢 store the candidate to display
  const employmentCredentials = selectedCandidate?.credentials?.employment
    ? [...selectedCandidate.credentials.employment].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
    : [];

  const educationCredentials = selectedCandidate?.credentials?.education
    ? [...selectedCandidate.credentials.education].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
    : [];

    // Add this at the top of your component (inside Home)
  const [activeMode, setActiveMode] = useState<'view' | 'add' | 'modify' | 'delete'>('view');
  const [openWalletModal, setOpenWalletModal] = useState(false)
  const [openPaymentModal, setOpenPaymentModal] = useState(false)
  const [openTokenModal, setOpenTokenModal] = useState(false)
  const [openEmploymentModal, setOpenEmploymentModal] = useState(false)
  const [openEducationModal, setOpenEducationModal] = useState(false)
  const [openVerifyModal, setOpenVerifyModal] = useState(false)
  const [openVIDModal, setOpenVIDModal] = useState(false)
  const [openCareerPassportModal, setOpenCareerPassportModal] = useState(false);
  const [generatedCredential, setGeneratedCredential] = useState<any | null>(null)
  const { activeAddress, transactionSigner } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const handleEmploymentCredential = async (credential: any) => {
    setOpenEmploymentModal(false)
    enqueueSnackbar('✅ Employment credential created successfully!', { variant: 'success' })
    if (!activeAddress || !activeAddress.length) {
      enqueueSnackbar('⚠️ Connect your wallet to issue credential.', { variant: 'warning' })
      return
    }
    if (!transactionSigner) {
      enqueueSnackbar('⚠️ Wallet signer not available.', { variant: 'error' })
      return
    }

    try {
      const credentialString = JSON.stringify(credential)
      const encoder = new TextEncoder()
      const credentialBytes = encoder.encode(credentialString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', credentialBytes)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      credential.logo = 'ipfs://bafkreid5s3jasdzpei6dcsm7gcontemmhw3htwk4bjkexbtejnt4ipmm7i'

      const jwt = import.meta.env.VITE_PINATA_JWT as string | undefined
      if (jwt) {
        const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({
            pinataOptions: { cidVersion: 1 },
            pinataMetadata: {
              name: `employment-${credential.employee_name}-${Date.now()}`
            },
            pinataContent: {
              ...credential,
              logo: credential.logo,
              image: credential.logo,
              hashHex
            },
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setGeneratedCredential({
            metadataUrl: `ipfs://${data.IpfsHash}`,
            hashHex,
            credentialData: credential,
          })
          enqueueSnackbar('📌 Credential pinned to IPFS', { variant: 'info' })
        } else {
          const fallbackMetadata = JSON.stringify(credential)
          setGeneratedCredential({ ...credential, metadataUrl: fallbackMetadata, hashHex })
          enqueueSnackbar('⚠️ Using inline JSON for NFT URL (Pinata failed)', { variant: 'warning' })
        }
      } else {
        const fallbackMetadata = JSON.stringify(credential)
        setGeneratedCredential({ ...credential, metadataUrl: fallbackMetadata, hashHex })
        enqueueSnackbar('⚠️ No Pinata JWT set, using inline JSON as metadata', { variant: 'warning' })
      }
    } catch (e) {
      console.error(e)
      enqueueSnackbar('❌ Failed to prepare credential.', { variant: 'error' })
    }
  }

  const handleEducationCredential = async (credential: any) => {
    setOpenEducationModal(false)
    enqueueSnackbar('✅ Education credential created successfully!', { variant: 'success' })
    if (!activeAddress || !activeAddress.length) {
      enqueueSnackbar('⚠️ Connect your wallet to issue credential.', { variant: 'warning' })
      return
    }
    if (!transactionSigner) {
      enqueueSnackbar('⚠️ Wallet signer not available.', { variant: 'error' })
      return
    }

    try {
      const credentialString = JSON.stringify(credential)
      const encoder = new TextEncoder()
      const credentialBytes = encoder.encode(credentialString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', credentialBytes)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      credential.logo = 'ipfs://bafkreibri6mh6xjqks54vlkdsuya6j7gb3nfexqkuu3upognux3cyir33y'
      credential.image = credential.logo

      const jwt = import.meta.env.VITE_PINATA_JWT as string | undefined
      if (jwt) {
        const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
          body: JSON.stringify({
            pinataOptions: { cidVersion: 1 },
            pinataMetadata: {
              name: `education-${credential.studentName}-${Date.now()}`,
            },
            pinataContent: {
              ...credential,
              logo: credential.logo,
              image: credential.image,
              hashHex,
            },
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setGeneratedCredential({
            metadataUrl: `ipfs://${data.IpfsHash}`,
            hashHex,
            credentialData: credential,
          })
          enqueueSnackbar('📌 Credential pinned to IPFS', { variant: 'info' })
        } else {
          const fallbackMetadata = JSON.stringify(credential)
          setGeneratedCredential({ ...credential, metadataUrl: fallbackMetadata, hashHex })
          enqueueSnackbar('⚠️ Using inline JSON for NFT URL (Pinata failed)', { variant: 'warning' })
        }
      } else {
        const fallbackMetadata = JSON.stringify(credential)
        setGeneratedCredential({ ...credential, metadataUrl: fallbackMetadata, hashHex })
        enqueueSnackbar('⚠️ No Pinata JWT set, using inline JSON as metadata', { variant: 'warning' })
      }
    } catch (e) {
      console.error(e)
      enqueueSnackbar('❌ Failed to prepare education credential.', { variant: 'error' })
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 relative">
      {/* 🟢 Top-right wallet button */}
      <div className="absolute top-6 right-10">
        <button
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: '#1C2D5A' }}
          onClick={() => setOpenWalletModal(true)}
        >
          {activeAddress ? 'Connected' : 'Login'}
        </button>
      </div>

      {/* 🟢 Top-left logo */}
      <div className="absolute top-6 left-10">
        <img src="/verifyHRlogo.jpg" alt="verifyHR logo" className="w-32 h-auto" />
      </div>

      <div className="flex flex-col items-center justify-start mt-32 w-full max-w-5xl">

        {activeAddress && (
          <div className="flex flex-row flex-wrap justify-center gap-4 w-full">
            {/* VERIFYID MANAGER CARD */}
            <div className="bg-white shadow-xl rounded-2xl p-8 text-center w-full sm:w-96 border border-gray-200 mb-4">
              <h2 className="text-xl font-semibold text-[#1C2D5A]">verifyID manager</h2>
              <p className="text-gray-600 mb-6">Create or confirm a unique verifyID (VID).</p>
              <button
                className="w-full py-2 rounded-lg text-white"
                style={{ backgroundColor: '#00C48C' }}
                onClick={() => setOpenVIDModal(true)}
              >
                create verifyID
              </button>
            </div>

            {/* VERIFY CARD */}
            <div className="bg-white shadow-xl rounded-2xl p-8 text-center w-full sm:w-96 border border-gray-200 mb-4">
              <h2 className="text-xl font-semibold text-[#1C2D5A]">verify</h2>
              <p className="text-gray-600 mb-6">One-step verification of a credential.</p>
              <button
                className="w-full py-2 rounded-lg text-white"
                style={{ backgroundColor: '#00C48C' }}
                onClick={() => setOpenVerifyModal(true)}
              >
                verify credential
              </button>
            </div>

            {/* CAREER PASSPORT CARD */}
            <div className="bg-white shadow-xl rounded-2xl p-8 text-center w-full sm:w-96 border border-gray-200 mb-4">
              <h2 className="text-xl font-semibold text-[#1C2D5A]">career passport</h2>
              <p className="text-gray-600 mb-6">View or amend credential records.</p>

              {/* 🟢 Added input field for candidate’s career passport assetID */}
              <div className="relative w-full mb-4 group">
                <input
                  type="text"
                  placeholder="Enter Asset ID"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                />
                <div className="absolute left-0 -top-8 w-max bg-gray-200 text-gray-800 text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Use Asset IDs 12345678 or 87654321 to test dummy candidates
                </div>
              </div>

              <button
                className="w-full py-2 rounded-lg text-[#1C2D5A] border border-[#1C2D5A] bg-white"
                onClick={() => {
                  const candidate = dummyCandidates.find(
                    (c) => c.assetId === Number(assetIdInput.trim())
                  )

                  if (candidate) {
                    setSelectedCandidate(candidate)
                    setOpenCareerPassportModal(true)
                  } else {
                    alert('Please enter a valid Asset ID for an existing candidate.')
                  }
                }}
              >
                access career passport
              </button>

            </div>

            {/* ISSUE CARD */}
            <div className="bg-white shadow-xl rounded-2xl p-8 text-center w-full sm:w-96 border border-gray-200 mb-4">
              <h2 className="text-xl font-semibold text-[#1C2D5A]">issue</h2>
              <p className="text-gray-600 mb-6">Create an individual credential.</p>
              <div className="flex flex-col gap-4">
                <button
                  className="w-full py-2 rounded-lg text-[#1C2D5A] border border-[#1C2D5A] bg-white"
                  onClick={() => setOpenEmploymentModal(true)}
                >
                  create employment credential
                </button>
                <button
                  className="w-full py-2 rounded-lg text-[#1C2D5A] border border-[#1C2D5A] bg-white"
                  onClick={() => setOpenEducationModal(true)}
                >
                  create education credential
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
      <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
      <NFTmint openModal={false} setModalState={() => {}} credentialJSON={generatedCredential} />
      <Tokenmint openModal={openTokenModal} setModalState={setOpenTokenModal} />
      <VerifyNFT openModal={openVerifyModal} setModalState={setOpenVerifyModal} />

      {openEmploymentModal && (
        <dialog id="employment_modal" className="modal modal-open bg-slate-200">
          <form method="dialog" className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">Issue Employment Credential</h3>
            <EmploymentForm onSubmit={handleEmploymentCredential} />
            <div className="modal-action">
              <button className="btn" onClick={() => setOpenEmploymentModal(false)}>Close</button>
            </div>
          </form>
        </dialog>
      )}

      {openEducationModal && (
        <dialog id="education_modal" className="modal modal-open bg-slate-200">
          <form method="dialog" className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">Issue Education Credential</h3>
            <EducationForm onSubmit={handleEducationCredential} />
            <div className="modal-action">
              <button className="btn" onClick={() => setOpenEducationModal(false)}>Close</button>
            </div>
          </form>
        </dialog>
      )}

      {openVIDModal && (
        <dialog className="modal modal-open bg-slate-200">
          <form method="dialog" className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">VerifyID Manager</h3>
            <VerifyIDManager closeModal={() => setOpenVIDModal(false)} />
            <div className="modal-action">
              <button className="btn" onClick={() => setOpenVIDModal(false)}>Close</button>
            </div>
          </form>
        </dialog>
      )}

      {openCareerPassportModal && (
        <dialog className="modal modal-open bg-slate-200">
          <form method="dialog" className="modal-box w-full max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Candidate Career Passport</h3>

            {/* 🟢 Top button row with Save, mode buttons, and candidate name */}
            <div className="flex flex-row justify-between items-center gap-3 mb-6">
              {/* Left: Candidate name */}
              {selectedCandidate && (
                <span className="text-gray-800 font-medium text-md pl-4">
                  {selectedCandidate.name}
                </span>
              )}

              {/* Right: Existing buttons */}
              <div className="flex flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMode('view')}
                  className={`px-4 py-2 rounded-lg ${
                    activeMode === 'view'
                      ? 'bg-[#1C2D5A] text-white'
                      : 'bg-white text-[#1C2D5A] border border-[#1C2D5A]'
                  }`}
                >
                  View
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('add')}
                  className={`px-4 py-2 rounded-lg ${
                    activeMode === 'add'
                      ? 'bg-[#1C2D5A] text-white'
                      : 'bg-white text-[#1C2D5A] border border-[#1C2D5A]'
                  }`}
                >
                  Add
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('modify')}
                  className={`px-4 py-2 rounded-lg ${
                    activeMode === 'modify'
                      ? 'bg-[#1C2D5A] text-white'
                      : 'bg-white text-[#1C2D5A] border border-[#1C2D5A]'
                  }`}
                >
                  Modify
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('delete')}
                  className={`px-4 py-2 rounded-lg ${
                    activeMode === 'delete'
                      ? 'bg-[#1C2D5A] text-white'
                      : 'bg-white text-[#1C2D5A] border border-[#1C2D5A]'
                  }`}
                >
                  Delete
                </button>

                <button
                  type="button"
                  className="px-4 py-2 bg-[#00C48C] text-white rounded-lg ml-2"
                >
                  Save
                </button>
              </div>
            </div>


            {/* 🟢 Content frame */}
            <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-auto bg-white">
              {/* Employment Credentials */}
              <h4 className="font-semibold mb-2">Employment Credentials</h4>
              {employmentCredentials.length > 0 ? (
                employmentCredentials.map((cred, idx) => (
                  <div key={`emp-${idx}`} className="border-b border-gray-200 py-2 flex justify-between items-center text-sm text-gray-800">
                    <span className="font-medium">{cred.role}</span>
                    <span className="text-gray-500">
                      {cred.company} • {cred.startDate} – {cred.endDate}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center mb-4">No employment records found.</p>
              )}

              {/* Education Credentials */}
              <h4 className="font-semibold mt-4 mb-2">Education Credentials</h4>
              {educationCredentials.length > 0 ? (
                educationCredentials.map((cred, idx) => (
                  <div key={`edu-${idx}`} className="border-b border-gray-200 py-2 flex justify-between items-center text-sm text-gray-800">
                    <span className="font-medium">{cred.degree || cred.name}</span>
                    <span className="text-gray-500">
                      {cred.institution} • {cred.startDate} – {cred.endDate}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">No education records found.</p>
              )}
            </div>

            <div className="modal-action mt-4">
              <button className="btn" onClick={() => setOpenCareerPassportModal(false)}>Close</button>
            </div>
          </form>
        </dialog>
      )}

    </div>
  )
}

export default Home
