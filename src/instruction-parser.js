const { BorshCoder } = require("@coral-xyz/anchor");
const BigNumber = require("bignumber.js");

const IDL = require("./idl/jupiter");

class InstructionParser {
  coder;
  programId;

  constructor(programId) {
    this.programId = programId;
    this.coder = new BorshCoder(IDL);
  }

  decodeInstructions(transaction) {
    const parsedInstructions = [];
    const accountKeys = transaction.message.staticAccountKeys;

    for (const instruction of transaction.message.compiledInstructions) {
      const programId = accountKeys[instruction.programIdIndex];
      const parsedTx = {
        programId,
        keys: accountKeys.map((account, index) => ({
          pubkey: account,
          isSigner: transaction.message.isAccountSigner(index),
          isWritable: transaction.message.isAccountWritable(index),
        })),
        data: Buffer.from(instruction.data),
      };
      parsedInstructions.push(parsedTx);
    }

    return parsedInstructions;
  }

  getInAndOutAmounts(jupiterInstructions) {
    let inAmount = BigNumber(0);
    let outputAmount = BigNumber(0);

    for (const instruction of jupiterInstructions) {
      if (!("data" in instruction)) continue; // Guard in case it is a parsed decoded instruction, should be impossible

      const ix = this.coder.instruction.decode(instruction.data.rawData);

      outputAmount = outputAmount.plus(ix.data.quotedOutAmount);
      inAmount = inAmount.plus(ix.data.inAmount);
    }

    return {
      inAmount,
      outputAmount,
    };
  }
}

module.exports = InstructionParser;
