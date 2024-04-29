const { BorshCoder } = require("@coral-xyz/anchor");
const BigNumber = require("bignumber.js");

const IDL = require("./idl/jupiter");

const PROGRAM_IDS_TO_IGNORE = new Set([
  "ComputeBudget111111111111111111111111111111", // Budget program (not sure what this is for)
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Token Account creation
]);

class InstructionParser {
  coder;
  programId;

  constructor(programId) {
    this.programId = programId;
    this.coder = new BorshCoder(IDL);
  }

  getInstructionNameAndTransferAuthorityAndLastAccount(instructions) {
    for (const instruction of instructions) {
      if (!instruction.programId.equals(this.programId)) {
        continue;
      }

      const ix = this.coder.instruction.decode(instruction.data, "base58");

      if (this.isRouting(ix.name)) {
        const instructionName = ix.name;
        const transferAuthority =
          instruction.accounts[
            this.getTransferAuthorityIndex(instructionName)
          ].toString();
        const lastAccount =
          instruction.accounts[instruction.accounts.length - 1].toString();

        return [ix.name, transferAuthority, lastAccount];
      }
    }

    return [];
  }

  getTransferAuthorityIndex(instructionName) {
    switch (instructionName) {
      case "route":
      case "exactOutRoute":
      case "routeWithTokenLedger":
        return 1;
      case "sharedAccountsRoute":
      case "sharedAccountsRouteWithTokenLedger":
      case "sharedAccountsExactOutRoute":
        return 2;
    }
  }

  // For CPI, we have to also check for innerInstructions.
  getJupiterInstructions(tx) {
    const parsedInstructions = [];
    const accountKeys = tx.transaction.message.staticAccountKeys;

    for (const instruction of tx.transaction.message.compiledInstructions) {
      const programId = accountKeys[instruction.programIdIndex];
      if (programId.equals(this.programId)) {
        parsedInstructions.push(instruction);
      }
    }

    return parsedInstructions;
  }

  // Extract the position of the initial and final swap from the swap array.
  getInitialAndFinalSwapPositions(instructions) {
    for (const instruction of instructions) {
      if (!instruction.programId.equals(this.programId)) {
        continue;
      }

      const ix = this.coder.instruction.decode(instruction.data, "base58");
      // This will happen because now event is also an CPI instruction.
      if (!ix) {
        continue;
      }

      if (this.isRouting(ix.name)) {
        const routePlan = ix.data.routePlan;
        const inputIndex = 0;
        const outputIndex = routePlan.length;

        const initialPositions = [];
        for (let j = 0; j < routePlan.length; j++) {
          if (routePlan[j].inputIndex === inputIndex) {
            initialPositions.push(j);
          }
        }

        const finalPositions = [];
        for (let j = 0; j < routePlan.length; j++) {
          if (routePlan[j].outputIndex === outputIndex) {
            finalPositions.push(j);
          }
        }

        if (finalPositions.length === 0 && this.isCircular(ix.data.routePlan)) {
          for (let j = 0; j < ix.data.routePlan.length; j++) {
            if (ix.data.routePlan[j].outputIndex === 0) {
              finalPositions.push(j);
            }
          }
        }

        return [initialPositions, finalPositions];
      }
    }
  }

  getExactOutAmount(instructions) {
    for (const instruction of instructions) {
      if (!instruction.programId.equals(this.programId)) {
        continue;
      }
      if (!("data" in instruction)) continue; // Guard in case it is a parsed decoded instruction, should be impossible

      const ix = this.coder.instruction.decode(instruction.data, "base58");

      if (this.isExactIn(ix.name)) {
        return ix.data.quotedOutAmount.toString();
      }
    }

    return;
  }

  getExactInAmount(instructions) {
    for (const instruction of instructions) {
      // if (!instruction.programId.equals(this.programId)) {
      //   continue;
      // }
      if (!("data" in instruction)) continue; // Guard in case it is a parsed decoded instruction, should be impossible

      // console.log({ data: instruction.data });
      const ix = this.coder.instruction.decode(
        Buffer.from(instruction.data).toString("hex"),
        "hex"
      );

      if (this.isExactOut(ix.name)) {
        return ix.data.quotedInAmount.toString();
      }

      console.log(ix.data.quotedOutAmount.toString());
      return ix.data.inAmount.toString();
    }
  }

  getInAndOutAmounts(jupiterInstructions) {
    let inAmount = BigNumber(0);
    let outputAmount = BigNumber(0);

    for (const instruction of jupiterInstructions) {
      if (!("data" in instruction)) continue; // Guard in case it is a parsed decoded instruction, should be impossible

      const ix = this.coder.instruction.decode(
        Buffer.from(instruction.data).toString("hex"),
        "hex"
      );

      // console.log({ ix });
      // console.log({ routePlan: ix.data.routePlan });
      // console.log(ix.data.routePlan.map((swap) => console.log(swap)));

      outputAmount = outputAmount.plus(ix.data.quotedOutAmount);
      inAmount = inAmount.plus(ix.data.inAmount);
    }

    return {
      inAmount,
      outputAmount,
    };
  }

  isExactIn(name) {
    return (
      name === "route" ||
      name === "routeWithTokenLedger" ||
      name === "sharedAccountsRoute" ||
      name === "sharedAccountsRouteWithTokenLedger"
    );
  }

  isExactOut(name) {
    return name === "sharedAccountsExactOutRoute" || name === "exactOutRoute";
  }

  isRouting(name) {
    return (
      name === "route" ||
      name === "routeWithTokenLedger" ||
      name === "sharedAccountsRoute" ||
      name === "sharedAccountsRouteWithTokenLedger" ||
      name === "sharedAccountsExactOutRoute" ||
      name === "exactOutRoute"
    );
  }

  isCircular(routePlan) {
    if (!routePlan || routePlan.length === 0) {
      return false; // Empty or null array is not circular
    }

    const indexMap = new Map(
      routePlan.map((obj) => [obj.inputIndex, obj.outputIndex])
    );
    let visited = new Set();
    let currentIndex = routePlan[0].inputIndex; // Start from the first object's inputIndex

    while (true) {
      if (visited.has(currentIndex)) {
        return currentIndex === routePlan[0].inputIndex;
      }

      visited.add(currentIndex);

      if (!indexMap.has(currentIndex)) {
        return false; // No further mapping, not circular
      }

      currentIndex = indexMap.get(currentIndex);
    }
  }
}

module.exports = InstructionParser;
