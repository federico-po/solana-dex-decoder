const solanaApi = require("@exodus/solana-api").default;
const { decodeTransactionInstructions } = require("@exodus/solana-lib");
const { PublicKey, VersionedTransaction } = require("@solana/web3.js");

const createWithLog = require("./logs");
const {
  knownInstructions,
  providerNameByAddress,
  JUPITER_V6_PROGRAM_ID,
} = require("./constants");
const InstructionParser = require("./instruction-parser");

// Ensures a Jupiter transaction is valid given:
// 1. SOL transfers are to known providers (e.g. liquidity providers)
// 2. There's only one Jupiter instruction and its valid (according to what the user agreed to swap)
// 3. There's no instruction from an unknown program
const decodeTransaction = async (base64TransactionData) => {
  const { withLog, logs } = createWithLog();
  try {
    const decodedTransactionData = Buffer.from(base64TransactionData, "base64");

    const transaction = VersionedTransaction.deserialize(
      decodedTransactionData
    );

    const instructionParser = new InstructionParser(
      new PublicKey(JUPITER_V6_PROGRAM_ID)
    );

    const instructions = withLog(
      "decodeInstructions",
      instructionParser.decodeInstructions(transaction)
    );

    const decodedInstructions = decodeTransactionInstructions(
      instructions.map((i) => ({ instructions: [i] }))
    );

    const jupiterInstructions = withLog(
      "jupiterInstructions",
      decodedInstructions.filter(
        (instruction) =>
          instruction.data.programId?.toBase58() === JUPITER_V6_PROGRAM_ID
      )
    );

    if (jupiterInstructions.length !== 1) {
      throw new Error(
        "One and only one Jupiter transaction was expected, was the transaction created via /swap?"
      );
    }

    const transferInstructions = withLog(
      "transferInstructions",
      decodedInstructions.filter(
        (instruction) => instruction.type === "systemTransfer"
      )
    );

    const owners = [];
    if (transferInstructions.length > 0) {
      const accountsData = await Promise.all(
        transferInstructions.map((instruction) =>
          solanaApi.getAccountInfo(instruction.data.toPubkey)
        )
      );

      owners.push(
        ...withLog(
          "owners",
          accountsData.map((account) => account.owner)
        )
      );

      if (
        !owners.some((ownerAddress) => providerNameByAddress.has(ownerAddress))
      ) {
        throw new Error(
          "Transaction includes an instruction from an unknown provider"
        );
      }

      // Ensures there's no instruction from an unknown program
      // This may mean an attacker manipulated the tx.
      const invalidDecodedInstructions = decodedInstructions.filter(
        (instruction) =>
          instruction.type === "unknown" &&
          !knownInstructions.has(instruction.data.programId.toBase58())
      );

      if (invalidDecodedInstructions.length > 0) {
        throw new Error(
          "Transaction includes an instruction from an unknown program"
        );
      }
    }

    const results = withLog(
      "results",
      instructionParser.getInAndOutAmounts(jupiterInstructions)
    );

    return {
      ...results,
      owners,
    };
  } catch (err) {
    console.error(err);
    throw new Error("Failed to decode transaction", { err, logs });
  }
};

module.exports = decodeTransaction;
