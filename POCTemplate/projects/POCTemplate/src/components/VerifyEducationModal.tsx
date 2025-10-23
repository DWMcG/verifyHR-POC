// src/components/VerifyEducationModal.tsx
import React from 'react'

interface VerifyEducationModalProps {
  open: boolean
  credential: {
    institution: string
    degree: string
    major: string
    startDate: string
    endDate?: string
    image?: string
  } | null
  onClose: () => void
}

const VerifyEducationModal: React.FC<VerifyEducationModalProps> = ({ open, credential, onClose }) => {
  if (!open || !credential) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">Education Credential</h2>
        {credential.image && (
          <img
            src={credential.image}
            alt="Institution Logo"
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
        )}
        <div className="flex flex-col gap-2">
          <div><strong>Institution:</strong> {credential.institution}</div>
          <div><strong>Degree:</strong> {credential.degree}</div>
          <div><strong>Major:</strong> {credential.major}</div>
          <div><strong>Start Date:</strong> {credential.startDate}</div>
          {credential.endDate && <div><strong>End Date:</strong> {credential.endDate}</div>}
        </div>
        <div className="modal-action mt-4 flex justify-end">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyEducationModal
