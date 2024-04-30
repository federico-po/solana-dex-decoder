const solanaApi = require("@exodus/solana-api").default;
const { decodeTransactionInstructions } = require("@exodus/solana-lib");
const { PublicKey, VersionedTransaction } = require("@solana/web3.js");
const fetch = require("cross-fetch/polyfill"); // TODO: this adds it to the built code, we need to check this.

const { Logs } = require("./logs");
const { providerNameByAddress } = require("./constants");

const InstructionParser = require("./instruction-parser");

const JUPITER_V6_PROGRAM_ID = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";

const createWithLog = (logs) => (name, result) => {
  logs.add(name, result);
  return result;
};

const decodeTransaction = async (base64TransactionData) => {
  const logs = new Logs();
  const withLog = createWithLog(logs);

  const decodedTransactionData = Buffer.from(base64TransactionData, "base64");

  const transaction = VersionedTransaction.deserialize(decodedTransactionData);

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
  }

  const results = withLog(
    "results",
    instructionParser.getInAndOutAmounts(jupiterInstructions)
  );

  return {
    ...results,
    owners,
  };
};

module.exports = decodeTransaction;
