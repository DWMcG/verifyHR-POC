// src/components/VerifyEmploymentModal.tsx
import React from 'react'

export interface EmploymentCredential {
  company: string
  role: string
  startDate: string
  endDate?: string
  image?: string
}

interface VerifyEmploymentModalProps {
  open: boolean
  credential: EmploymentCredential | null
  onClose: () => void
}

const VerifyEmploymentModal: React.FC<VerifyEmploymentModalProps> = ({ open, credential, onClose }) => {
  if (!open || !credential) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">Employment Credential</h2>
        {credential.image && (
          <img
            src={credential.image}
            alt="Company Logo"
            className="w-32 h-32 object-contain mx-auto mb-4"
          />
        )}
        <div className="flex flex-col gap-2">
          <div><strong>Company:</strong> {credential.company}</div>
          <div><strong>Role:</strong> {credential.role}</div>
          <div><strong>Start Date:</strong> {credential.startDate}</div>
          {credential.endDate && <div><strong>End Date:</strong> {credential.endDate}</div>}
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 rounded-lg border bg-gray-100 hover:bg-gray-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmploymentModal
