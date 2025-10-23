import React, { useState, useMemo } from "react";
import { enqueueSnackbar } from "notistack";
import { generateVID } from "../utils/hashVID";
import { useWallet } from "@txnlab/use-wallet-react";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { getAlgodConfigFromViteEnvironment } from "../utils/network/getAlgoClientConfigs";

interface VerifyIDManagerProps {
  closeModal?: () => void; // optional for Home.tsx modal
}

const VerifyIDManager: React.FC<VerifyIDManagerProps> = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    passportNumber: "",
    passportConfirm: "",
  });

  const { transactionSigner, activeAddress } = useWallet();
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { fullName, dob, passportNumber, passportConfirm } = formData;

    // Basic validation
    if (!fullName || !dob || !passportNumber || !passportConfirm) {
      enqueueSnackbar("Please complete all fields.", { variant: "warning" });
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

      // Step 2: Create Career Passport ASA (template-compliant logic from TokenMint)
      const createResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: 1n, // one passport per user
        decimals: 0,
        assetName: "verifyHR Career Passport",
        unitName: "verifyCP",
        defaultFrozen: false,
        metadataHash: Buffer.from(vid, "hex"),
      });

      // Step 3: Log VID and ASA assetId for recording
      console.log("✅ VID:", vid);
      console.log("✅ Career Passport ASA Asset ID:", createResult.assetId);

      enqueueSnackbar(
        "✅ VID & Career Passport ASA created. Check console for values.",
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
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
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
          Generate VerifyID & Create Career Passport
        </button>
      </form>
    </div>
  );
};

export default VerifyIDManager;
