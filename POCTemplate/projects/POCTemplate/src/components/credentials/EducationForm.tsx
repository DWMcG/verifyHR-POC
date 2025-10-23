// src/components/credentials/EducationForm.tsx
import React, { useState } from "react";

export interface EducationFormData {
  studentName: string;
  studentId: string;
  degree: string;
  major: string;
  institution: string;
  startDate: string;
  endDate?: string;
  referenceId?: string;
  credentialProof?: string;
  notes?: string;
  version?: string;
  image?: string;
}

export interface EducationFormProps {
  onSubmit: (
    credential: EducationFormData & {
      credential_id: string;
      type: string;
      status: string;
      issueDate: string;
    }
  ) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<EducationFormData>({
    studentName: "",
    studentId: "",
    degree: "",
    major: "",
    institution: "",
    startDate: "",
    endDate: "",
    referenceId: "",
    credentialProof: "",
    notes: "",
    version: "1.0",
    image: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const credential_id = `EDU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const credential = {
      credential_id,
      type: "education",
      ...formData,
      status: formData.endDate ? "closed" : "open",
      issueDate: new Date().toISOString().split("T")[0],
    };
    onSubmit(credential);
  };

  return (
    <form className="flex flex-col gap-3 p-4 border rounded-md shadow-md">
      <input
        type="text"
        name="studentName"
        placeholder="Student Name"
        value={formData.studentName}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="studentId"
        placeholder="Student ID"
        value={formData.studentId}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="degree"
        placeholder="Degree"
        value={formData.degree}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="major"
        placeholder="Major"
        value={formData.major}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="institution"
        placeholder="Institution"
        value={formData.institution}
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
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 bg-primary text-white rounded-md"
        style={{ backgroundColor: "#1C2D5A" }}
      >
        issue education credential
      </button>

      <div className="text-sm text-gray-500 mt-2 text-center">
        Version: {formData.version}
      </div>
    </form>
  );
};

export default EducationForm;
