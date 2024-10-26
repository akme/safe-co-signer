import { createSafeClient } from "@safe-global/sdk-starter-kit";
import { ethers } from "ethers";

import { pino } from "pino";

// ERC-20 Transfer ABI
const ERC20_TRANSFER_ABI = ["function transfer(address to, uint256 value)"];

// Function to decode transaction data
function decodeTransactionData(data) {
  const iface = new ethers.Interface(ERC20_TRANSFER_ABI);
  try {
    const decoded = iface.parseTransaction({ data });
    return decoded.args.to;
  } catch (error) {
    //   logger.error("Failed to decode transaction data: " + error.message);
    return null;
  }
}

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

  // Decode the transaction data to get the destination address
  const destinationAddress = decodeTransactionData(transaction.data);
  if (
    !WHITELIST.map((address) => address.toLowerCase()).includes(
      transaction.to.toLowerCase()
    ) &&
    (!destinationAddress ||
      !WHITELIST.map((address) => address.toLowerCase()).includes(
        destinationAddress.toLowerCase()
      ))
  ) {
    logger.info(
      "Skipping transaction " +
        transaction.safeTxHash +
        " for non-whitelisted address"
    );
    continue;
  }
  try {
    logger.info(
      "Confirming transaction " +
        transaction.safeTxHash +
        " nonce: " +
        transaction.nonce +
        " for a whitelisted address"
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
        " " +
        error.details +
        "\nSuggestion: check that transaction with nonce " +
        (transaction.nonce - 1) +
        " is confirmed and mined or if you have enough funds to pay for gas. Probably trasaction was confirmed but not submitted to the network."
    );
    continue;
  }
}
