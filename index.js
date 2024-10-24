import { createSafeClient } from "@safe-global/sdk-starter-kit";

import { pino } from "pino";

// Create a logging instance
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;
const SAFE_ADDRESS = process.env.SAFE_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const WHITELIST = JSON.parse(process.env.WHITELIST);

const safeClient = await createSafeClient({
  provider: RPC_URL,
  signer: SIGNER_PRIVATE_KEY,
  safeAddress: SAFE_ADDRESS,
});

const pendingTransactions = await safeClient.getPendingTransactions();
if (pendingTransactions.results.length === 0) {
  logger.info("No pending transactions to confirm.");
  process.exit(0);
} else {
  logger.info("Pending transactions: " + pendingTransactions.results.length);
}

const sortedTransactions = pendingTransactions.results.sort(
  (a, b) => a.nonce - b.nonce
);

for (const transaction of sortedTransactions) {
  logger.info(
    "Checking transaction " +
      transaction.safeTxHash +
      " nonce: " +
      transaction.nonce
  );
  if (
    !WHITELIST.map((address) => address.toLowerCase()).includes(
      transaction.to.toLowerCase()
    )
  ) {
    logger.info(
      "Skipping transaction " +
        transaction.safeTxHash +
        " for non-whitelisted address: " +
        transaction.to
    );
    continue;
  }
  try {
    logger.info(
      "Confirming transaction " +
        transaction.safeTxHash +
        " for whitelisted address: " +
        transaction.to +
        " nonce: " +
        transaction.nonce
    );
    const txResult = await safeClient.confirm(transaction);
    logger.warn(
      "Confirmed Tx: " + transaction.safeTxHash + " status: " + txResult.status
    );
  } catch (error) {
    logger.error(
      "Error confirming transaction " +
        transaction.safeTxHash +
        " with nonce: " +
        transaction.nonce +
        " status: " +
        error.shortMessage +
        "\nSuggestion: check that transaction with nonce " +
        (transaction.nonce - 1) +
        " is confirmed and mined."
    );
    break;
  }
}
