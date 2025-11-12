import React, { useState, useEffect } from 'react'
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
import { AlgorandClient } from "@algorandfoundation/algokit-utils"
import { getAlgodConfigFromViteEnvironment } from "./utils/network/getAlgoClientConfigs"
import algosdk, { Algodv2 } from "algosdk";

interface CandidateType {
  assetId: number;
  fullName: string;
}

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [assetIdInput, setAssetIdInput] = useState('');   // 🟢 store the value of the assetID input
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null) // 🟢 store the candidate to display
  const [candidates, setCandidates] = useState<any[]>([]);
  const [newCandidates, setNewCandidates] = useState<CandidateType[]>([]);
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
  // Track the type of credential being added
  const [newCredentialType, setNewCredentialType] = useState<'employment' | 'education'>('employment');

  // Track new credential input
  const [newCredential, setNewCredential] = useState<any>({
    employeeName: '',
    employeeId: '',
    role: '',
    company: '',
    startDate: '',
    endDate: '',
    issueDate: '',
    referenceId: '',
    credentialProof: '',
    notes: '',
    image: '',
    // Education fields
    studentName: '',
    studentId: '',
    degree: '',
    major: '',
    institution: '',
  });

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

  useEffect(() => {
    fetch('/dummyCandidates.json')
      .then((res) => res.json())
      .then((data) => setCandidates(data))
      .catch((err) => console.error('Failed to load candidate data', err));
  }, []);

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
            {/* verifyID MANAGER CARD */}
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
              <input
                type="text"
                placeholder="Enter Asset ID"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4"
                value={assetIdInput}                        // 🟢 bind to state
                onChange={(e) => setAssetIdInput(e.target.value)} // 🟢 update state when user types
              />

              <button
                className="w-full py-2 rounded-lg text-[#1C2D5A] border border-[#1C2D5A] bg-white"
                onClick={async () => {
                  const assetIdNumber = Number(assetIdInput.trim());
                  if (!assetIdNumber) {
                    alert('Please enter a valid Asset ID.');
                    return;
                  }

                  // 1️⃣ Check dummyCandidates.json first
                  let candidate = candidates.find((c) => c.assetId === assetIdNumber);

                  if (candidate) {
                    setSelectedCandidate(candidate);
                    setOpenCareerPassportModal(true);
                    return;
                  }

                  // 2️⃣ If not found, check on-chain
                  try {
                    const algodConfig = getAlgodConfigFromViteEnvironment();
                    const algorand = AlgorandClient.fromConfig({ algodConfig });

                    const algod = algorand.client.algod;
                    const asaInfo = await algod.getAssetByID(assetIdNumber).do();

                    if (asaInfo && asaInfo.params.name === 'vHR' && asaInfo.params.unitName === 'verifyCP') {
                      const onChainCandidate = {
                        assetId: assetIdNumber,
                        fullName: 'On-chain Candidate',
                        credentials: { employment: [], education: [] },
                        onChain: true,
                      };
                      setSelectedCandidate(onChainCandidate);
                      setOpenCareerPassportModal(true);
                    } else {
                      alert('No candidate found with this Asset ID or it is not a valid career passport ASA.');
                    }

                  } catch (err) {
                    console.error('Error fetching on-chain ASA:', err);
                    alert('Failed to fetch on-chain career passport. Check console for details.');
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
          <div className="modal-box w-full max-w-md">
            <h3 className="font-bold text-lg mb-2">verifyID manager</h3>
            <VerifyIDManager 
              closeModal={() => setOpenVIDModal(false)}
              onASACreated={(asaId) => {
                setAssetIdInput(asaId);

                // Add newly created ASA to in-memory list
                setNewCandidates(prev => [
                  ...prev, 
                  { assetId: Number(asaId), fullName: "New Candidate" } // adjust fullName if you want real name
                ]);
              }}
            />

            <div className="modal-action">
              <button className="btn" onClick={() => setOpenVIDModal(false)}>Close</button>
            </div>
          </div>
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
                    onClick={() => {
                      setActiveMode('add');

                      // Ensure toggle and form both reset to employment
                      setNewCredentialType('employment');
                      setNewCredential({
                        credentialType: 'EmploymentCredential',
                        employeeName: '',
                        employeeId: '',
                        role: '',
                        company: '',
                        startDate: '',
                        endDate: '',
                        issueDate: '',
                        referenceId: '',
                        credentialProof: '',
                        notes: '',
                        image: '',
                        // Education fields
                        studentName: '',
                        studentId: '',
                        degree: '',
                        major: '',
                        institution: '',
                      });
                    }}
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
            
              {activeMode === 'view' && (
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
              )}

              {activeMode === 'add' && (
                <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-white">
                  {/* Credential type toggle */}
                  <div className="mb-4 flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="credentialType"
                        value="employment"
                        checked={newCredential.credentialType === 'EmploymentCredential'}
                        onChange={() =>
                          setNewCredential({ ...newCredential, credentialType: 'EmploymentCredential' })
                        }
                      />
                      Employment
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="credentialType"
                        value="education"
                        checked={newCredential.credentialType === 'EducationCredential'}
                        onChange={() =>
                          setNewCredential({ ...newCredential, credentialType: 'EducationCredential' })
                        }
                      />
                      Education
                    </label>
                  </div>

                  {/* Full credential form */}
                  <div className="grid grid-cols-2 gap-4">
                    {newCredential.credentialType === 'EmploymentCredential' ? (
                      <>
                        <input
                          type="text"
                          placeholder="Employee Name"
                          value={newCredential.employeeName}
                          onChange={(e) => setNewCredential({ ...newCredential, employeeName: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Employee ID"
                          value={newCredential.employeeId}
                          onChange={(e) => setNewCredential({ ...newCredential, employeeId: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Role"
                          value={newCredential.role}
                          onChange={(e) => setNewCredential({ ...newCredential, role: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={newCredential.company}
                          onChange={(e) => setNewCredential({ ...newCredential, company: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="date"
                          placeholder="Start Date"
                          value={newCredential.startDate}
                          onChange={(e) => setNewCredential({ ...newCredential, startDate: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="date"
                          placeholder="End Date"
                          value={newCredential.endDate}
                          onChange={(e) => setNewCredential({ ...newCredential, endDate: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="date"
                          placeholder="Issue Date"
                          value={newCredential.issueDate}
                          onChange={(e) => setNewCredential({ ...newCredential, issueDate: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Reference ID"
                          value={newCredential.referenceId}
                          onChange={(e) => setNewCredential({ ...newCredential, referenceId: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Credential Proof URL"
                          value={newCredential.credentialProof}
                          onChange={(e) => setNewCredential({ ...newCredential, credentialProof: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Notes"
                          value={newCredential.notes}
                          onChange={(e) => setNewCredential({ ...newCredential, notes: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={newCredential.image}
                          onChange={(e) => setNewCredential({ ...newCredential, image: e.target.value })}
                          className="input input-bordered w-full"
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Student Name"
                          value={newCredential.studentName}
                          onChange={(e) => setNewCredential({ ...newCredential, studentName: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Student ID"
                          value={newCredential.studentId}
                          onChange={(e) => setNewCredential({ ...newCredential, studentId: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Degree"
                          value={newCredential.degree}
                          onChange={(e) => setNewCredential({ ...newCredential, degree: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Major"
                          value={newCredential.major}
                          onChange={(e) => setNewCredential({ ...newCredential, major: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Institution"
                          value={newCredential.institution}
                          onChange={(e) => setNewCredential({ ...newCredential, institution: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="date"
                          placeholder="Start Date"
                          value={newCredential.startDate}
                          onChange={(e) => setNewCredential({ ...newCredential, startDate: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="date"
                          placeholder="End Date"
                          value={newCredential.endDate}
                          onChange={(e) => setNewCredential({ ...newCredential, endDate: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="date"
                          placeholder="Issue Date"
                          value={newCredential.issueDate}
                          onChange={(e) => setNewCredential({ ...newCredential, issueDate: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Reference ID"
                          value={newCredential.referenceId}
                          onChange={(e) => setNewCredential({ ...newCredential, referenceId: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Credential Proof URL"
                          value={newCredential.credentialProof}
                          onChange={(e) => setNewCredential({ ...newCredential, credentialProof: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Notes"
                          value={newCredential.notes}
                          onChange={(e) => setNewCredential({ ...newCredential, notes: e.target.value })}
                          className="input input-bordered w-full"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={newCredential.image}
                          onChange={(e) => setNewCredential({ ...newCredential, image: e.target.value })}
                          className="input input-bordered w-full"
                        />
                      </>
                    )}
                  </div>

                  <button
                    className="mt-4 px-4 py-2 bg-[#00C48C] text-white rounded-lg"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (!selectedCandidate) return;

                      try {
                        // 1️⃣ Pick the correct JSON template
                        const employmentCredentialUrl = "https://gateway.pinata.cloud/ipfs/bafkreic6pt32t65257cq5o5oa2y3xtsnlnksjroh7casslkky7i5ehv2lq";
                        const educationCredentialUrl = "https://gateway.pinata.cloud/ipfs/bafkreicwt3ummeg7o5duyep7mvunisgdodmcodsk5adac4xv5op2xwgtga";
                        const credentialUrl = newCredential.credentialType === "EmploymentCredential"
                            ? employmentCredentialUrl
                            : educationCredentialUrl;

                        // 2️⃣ Instantiate Algorand client
                        const algodClient = new Algodv2(
                          import.meta.env.VITE_ALGOD_TOKEN,
                          import.meta.env.VITE_ALGOD_SERVER,
                          import.meta.env.VITE_ALGOD_PORT
                        );

                        // 3️⃣ Prepare and send transaction via wallet
                        const suggestedParams = await algodClient.getTransactionParams().do();

                        const txn = algosdk.makeApplicationNoOpTxnFromObject({
                          from: activeAddress,
                          appIndex: selectedCandidate.asaAppId,
                          appArgs: [
                            new Uint8Array(Buffer.from("addCredential")),
                            new Uint8Array(Buffer.from(credentialUrl)),
                            new Uint8Array(Buffer.from(newCredential.credentialType)),
                          ],
                          suggestedParams,
                        });

                        const encodedTxn = algosdk.encodeUnsignedTransaction(txn);
                        const signedTxns = await signTransactions([encodedTxn]);
                        const { txId } = await sendTransactions(signedTxns, 4); // waits up to 4 rounds

                        enqueueSnackbar("✅ Credential added on-chain! TxID: " + txId, { variant: "success" });

                        // 5️⃣ Reset form
                        setNewCredential({
                          credentialType: 'EmploymentCredential',
                          employeeName: '',
                          employeeId: '',
                          role: '',
                          company: '',
                          startDate: '',
                          endDate: '',
                          issueDate: '',
                          referenceId: '',
                          credentialProof: '',
                          notes: '',
                          image: '',
                          degree: '',
                          major: '',
                          studentName: '',
                          studentId: '',
                          institution: '',
                        });

                      } catch (err) {
                        console.error(err);
                        enqueueSnackbar("❌ Failed to add credential on-chain", { variant: "error" });
                      }
                    }}
                  >
                    Add Credential
                  </button>
                </div>
              )}

              <div className="modal-action mt-4">
                <button
                  className="btn"
                  onClick={() => {
                    setOpenCareerPassportModal(false);
                    setActiveMode('view'); // 🟢 Reset to view mode when closing
                  }}
                >
                  Close
                </button>
              </div>

            </form>
          </dialog>
        )}

    </div>
  )
}

export default Home
