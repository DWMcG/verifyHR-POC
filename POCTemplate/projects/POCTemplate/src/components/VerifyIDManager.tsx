import React, { useState, useMemo } from "react";
import { enqueueSnackbar } from "notistack";
import { generateVID } from "../utils/hashVID";
import { useWallet } from "@txnlab/use-wallet-react";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { getAlgodConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";

interface VerifyIDManagerProps {
  closeModal?: () => void; // optional for Home.tsx modal
  onASACreated?: (asaId: string) => void; // 🟢 new callback
}

const VerifyIDManager: React.FC<VerifyIDManagerProps> = ({ closeModal, onASACreated }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    passportNumber: "",
    passportConfirm: "",
  });

  const [createdASAId, setCreatedASAId] = useState(''); // 🟢 stores ASA just created

  const { transactionSigner, activeAddress } = useWallet();
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("handleSubmit fired");
    console.log("transactionSigner:", transactionSigner);
    console.log("activeAddress:", activeAddress);

    const { fullName, dob, passportNumber, passportConfirm } = formData;

    // Basic validation
    if (!fullName || !dob || !passportNumber || !passportConfirm) {
      enqueueSnackbar("Please complete all fields.", { variant: "warning" });
      return;
    }
    // Validate date of birth year
    const dobYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    if (dobYear < 1900 || dobYear > currentYear) {
      enqueueSnackbar(`Please enter a valid year between 1900 and ${currentYear}.`, { variant: "warning" });
      return;
    }
    if (passportNumber !== passportConfirm) {
      enqueueSnackbar("Passport numbers do not match.", { variant: "error" });
      return;
    }
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar("Please connect your wallet first.", { variant: "warning" });
      return;
    }

    try {
      // Step 1: Generate VID (full SHA-256)
      const vid = await generateVID(fullName, dob, passportNumber);

      // Step 2: Create Career Passport ASA (non-transferable, one per candidate)
      const createResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: 1n,
        decimals: 0,
        assetName: "vHR",
        unitName: "verifyCP",
        defaultFrozen: false,
        metadataHash: Buffer.from(vid, "hex"),
      });

      // store locally in VerifyIDManager (optional)
      setCreatedASAId(String(createResult.assetId));

      // 🟢 notify Home.tsx to populate the career passport input
      console.log("🟢 createResult.assetId:", createResult.assetId);
      if (onASACreated) onASACreated(String(createResult.assetId));


      // Log for reference
      console.log("Active Address:", activeAddress);
      console.log("Transaction Signer:", transactionSigner);
      console.log("VID:", vid);
      console.log("✅ Career Passport ASA Asset ID:", createResult.assetId);

      enqueueSnackbar(
        "✅ VID & Career Passport ASA created. Asset ID displayed in career passport modal.",
        { variant: "success" }
      );
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Error creating VID and ASA.", { variant: "error" });
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6 mt-2">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            type="text"
            name="dob"
            placeholder="YYYY-MM-DD"
            value={formData.dob}
            onChange={(e) => {
              const val = e.target.value;
              // only allow 4 digits for year, 2 for month/day
              if (/^\d{0,4}(-\d{0,2}(-\d{0,2})?)?$/.test(val)) {
                setFormData({ ...formData, dob: val });
              }
            }}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Passport / ID Number</label>
          <input
            type="text"
            name="passportNumber"
            value={formData.passportNumber}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Passport / ID Number</label>
          <input
            type="text"
            name="passportConfirm"
            value={formData.passportConfirm}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
            onCopy={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
        >
          Generate verifyID & create Career Passport
        </button>
      </form>
    </div>
  );
};

export default VerifyIDManager;
