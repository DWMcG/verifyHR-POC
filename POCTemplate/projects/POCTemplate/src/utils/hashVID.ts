import algosdk from "algosdk";

/**
 * Generates a deterministic VerifyID hash from user identity fields.
 * Ensures the same input always yields the same VID, but cannot be reverse-engineered.
 */
export const generateVID = async (
  fullName: string,
  dob: string,
  passportNumber: string
): Promise<string> => {
  const input = `${fullName.trim().toLowerCase()}|${dob}|${passportNumber.trim().toUpperCase()}`;
  const buffer = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // full SHA-256 hex string
};
