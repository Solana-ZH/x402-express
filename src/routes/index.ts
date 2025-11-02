import { Router, Request, Response } from "express";
import { express as middleware } from "@faremeter/middleware";
import { solana } from "@faremeter/info";
import { PublicKey } from "@solana/web3.js";

const router: Router = Router();

(async () => {
  // Standard API route
  router.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "Welcome to X402 API",
      version: "1.0.0",
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  // get faucet : https://faucet.circle.com/
  // Note: payTo must be a valid Solana address (base58 encoded)
  // You can set PAY_TO_ADDRESS in .env file, or use the default test address
  const payToAddress =
    process.env.PAY_TO_ADDRESS ||
    "Dy6mBH4YeqJCRZohd39iSFaf4jyLaxPeBakbZwt1jToL";

  // Validate the address format
  try {
    new PublicKey(payToAddress);
    console.log("Using payTo address:", payToAddress);
  } catch (error: any) {
    throw new Error(
      `Invalid PAY_TO_ADDRESS: ${payToAddress}. Error: ${error.message}`
    );
  }

  const usdcExtract = solana.x402Exact({
    network: "mainnet-beta",
    asset: "USDC",
    amount: "100",
    payTo: payToAddress,
  });

  router.use((req, _res, next) => {
    console.log("request received", req.url);
    console.log("request method", req.method);
    console.log("request headers", req.headers);
    next();
  });

  router.get(
    "/protected",
    await middleware.createMiddleware({
      facilitatorURL: "https://facilitator.corbits.io",
      accepts: [usdcExtract],
    }),
    (_, res) => {
      return res.json({
        msg: "success",
      });
    }
  );

  // Add more routes here
  // router.use('/users', userRoutes);
  // router.use('/posts', postRoutes);
})();

export default router;
