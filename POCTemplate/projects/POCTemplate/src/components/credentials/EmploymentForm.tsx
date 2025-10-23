// src/components/credentials/EmploymentForm.tsx
import React, { useState } from "react";

export interface EmploymentFormData {
  employeeName: string;
  employeeId: string;
  employeeWallet: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  referenceId?: string;
  credentialProof?: string;
  notes?: string;
  version?: string;
  image?: string;
}

export interface EmploymentFormProps {
  onSubmit: (
    credential: EmploymentFormData & {
      credential_id: string;
      type: string;
      status: string;
      issue_date: string;
    }
  ) => void;
}

const EmploymentForm: React.FC<EmploymentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<EmploymentFormData>({
    employeeName: "",
    employeeId: "",
    employeeWallet: "",
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    referenceId: "",
    credentialProof: "",
    notes: "",
    version: "1.1",
    image: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Generate credential ID
    const credential_id = `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const credential = {
      credential_id,
      type: "employment",
      ...formData,
      end_date: formData.endDate || undefined,
      status: formData.endDate ? "closed" : "open",
      issue_date: new Date().toISOString().split("T")[0],
    };

    // Pass credential back to Home.tsx
    onSubmit(credential);
  };

  return (
    <form className="flex flex-col gap-3 p-4 border rounded-md shadow-md">
      <input
        type="text"
        name="employeeName"
        placeholder="Employee Name"
        value={formData.employeeName}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="employeeId"
        placeholder="Employee ID"
        value={formData.employeeId}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="employeeWallet"
        placeholder="Employee Wallet"
        value={formData.employeeWallet}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="company"
        placeholder="Company"
        value={formData.company}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="role"
        placeholder="Role"
        value={formData.role}
        onChange={handleChange}
        required
      />
            {/* Start Date */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 w-24">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
          className="flex-1"
        />
      </div>

      {/* End Date */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 w-24">End Date</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="flex-1"
        />
      </div>
      <input
        type="text"
        name="referenceId"
        placeholder="Reference ID (optional)"
        value={formData.referenceId}
        onChange={handleChange}
      />
      <input
        type="text"
        name="credentialProof"
        placeholder="Credential Proof URL (optional)"
        value={formData.credentialProof}
        onChange={handleChange}
      />
      <input
        type="text"
        name="notes"
        placeholder="Notes (optional)"
        value={formData.notes}
        onChange={handleChange}
      />
      <input
        type="text"
        name="image"
        placeholder="Image IPFS URL (optional)"
        value={formData.image}
        onChange={handleChange}
      />

      <button
        type="button"              // <-- Changed from "submit"
        onClick={handleSubmit}      // <-- Added this line
        className="px-4 py-2 bg-primary text-white rounded-md"
        style={{ backgroundColor: "#1C2D5A" }}
      >
        issue employment credential
      </button>

      {/* Version display below the button */}
      <div className="text-sm text-gray-500 mt-2 text-center">
        Version: {formData.version}
      </div>
    </form>
  );
};

export default EmploymentForm;
