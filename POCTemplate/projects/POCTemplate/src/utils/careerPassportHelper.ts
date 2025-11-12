// src/utils/careerPassportHelper.ts
import { Algodv2 } from "algosdk";
import { useWallet } from "@txnlab/use-wallet-react";

interface CareerPassportHelperProps {
  algodClient: Algodv2;
  walletAddress: string;
  transactionSigner: any;
}

/**
 * Helper class to interact with the CareerPassport smart contract.
 */
export class CareerPassportHelper {
  algodClient: Algodv2;
  walletAddress: string;
  signer: any;

  constructor({ algodClient, walletAddress, transactionSigner }: CareerPassportHelperProps) {
    this.algodClient = algodClient;
    this.walletAddress = walletAddress;
    this.signer = transactionSigner;
  }

  /**
   * Add a credential to a career passport ASA
   * @param asaId The asset ID of the career passport
   * @param credentialJSON JSON string of credential data
   */
  async addCredential(asaId: number, credentialJSON: string) {
    const txn = {
      type: "appl",
      from: this.walletAddress,
      appIndex: 0, // Replace with deployed CareerPassport app ID
      appArgs: [new Uint8Array(Buffer.from("addCredential")), new Uint8Array(Buffer.from(credentialJSON))],
      foreignAssets: [asaId],
      fee: 2000,
    };

    return this.signAndSend(txn);
  }

  /**
   * View credentials stored in a career passport ASA
   * Returns raw bytes; frontend will parse JSON array
   * @param asaId
   */
  async viewCredentials(asaId: number) {
    // Frontend can read box directly via algod client
    const boxKey = Buffer.from(`credentials-${asaId}`);
    const accountInfo = await this.algodClient.accountInformation(this.walletAddress).do();

    // Look for boxes
    const boxes = accountInfo.appsLocalState?.flatMap((app: any) =>
    app['key-value']?.filter((kv: any) => kv.key === boxKey) ?? []
    ) ?? [];

    if (boxes.length) {
    return Buffer.from(boxes[0].value.bytes, "base64").toString();
    } else {
    return null;
    }
  }

  /**
   * Generic signer + send helper
   */
  private async signAndSend(txn: any) {
    if (!this.signer) throw new Error("Wallet not connected");

    const signedTxn = await this.signer(txn);
    const txId = await this.algodClient.sendRawTransaction(signedTxn).do();
    return txId;
  }
}
