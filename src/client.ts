import {
  Keypair,
  PublicKey,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";
import { exact as solanaExact } from "@faremeter/payment-solana";
import { wrap } from "@faremeter/fetch";
import { solana } from "@faremeter/info";
import dotenv from "dotenv";
dotenv.config();

// Load keypair from file
const keypairData = JSON.parse(process.env.SECRET_KEY as string);
const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));

console.log(`current address ${keypair.publicKey.toBase58()}`);

const network = "mainnet-beta";
const connection = new Connection("https://api.mainnet-beta.solana.com");
const usdcInfo = solana.lookupKnownSPLToken(network, "USDC");
if (!usdcInfo) {
  throw new Error("USDC info not found");
}
const usdcMint = new PublicKey(usdcInfo.address);
console.log(`USDC mint address ${usdcMint.toBase58()}`);

// Create wallet interface
const wallet = {
  network,
  publicKey: keypair.publicKey,
  updateTransaction: async (tx: VersionedTransaction) => {
    tx.sign([keypair]);
    return tx;
  },
};

const main = async () => {
  // Setup payment handler
  const handler = solanaExact.createPaymentHandler(
    wallet,
    usdcMint,
    connection
  );
  const fetchWithPayer = wrap(fetch, { handlers: [handler] });

  // // Call the API - payment happens automatically
  // const response = await fetchWithPayer("https://helius.api.corbits.dev", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     jsonrpc: "2.0",
  //     id: 1,
  //     method: "getBlockHeight",
  //   }),
  // });

  const response = await fetchWithPayer(
    "https://x402-express.vercel.app/api/protected"
  );

  const data = await response.json();
  console.log(data);
};

main();
