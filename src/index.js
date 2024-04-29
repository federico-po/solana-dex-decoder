// If the jupiter instruction's sender is my account, that means it hasn't been manipulated.
// Thus, we could avoid getting into its details.
// We still need to check every other instruction in the transaction to make sure there's no a Transfer (for example) to another person.
const solanaApi = require("@exodus/solana-api").default;
const { decodeTransactionInstructions } = require("@exodus/solana-lib");
const { PublicKey, VersionedTransaction } = require("@solana/web3.js");
const fetch = require("cross-fetch/polyfill");

const InstructionParser = require("./instruction-parser");

const JUPITER_V6_PROGRAM_ID = "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4";

const decodeTransaction = async (base64TransactionData) => {
  const decodedTransactionData = Buffer.from(base64TransactionData, "base64");

  const transaction = VersionedTransaction.deserialize(decodedTransactionData);

  const instructionParser = new InstructionParser(
    new PublicKey(JUPITER_V6_PROGRAM_ID)
  );

  const instructions = instructionParser.decodeInstructions(transaction);

  const decodedInstructions = decodeTransactionInstructions(
    instructions.map((i) => ({ instructions: [i] }))
  );

  const jupiterInstruction = decodedInstructions.find(
    (instruction) =>
      instruction.data.programId?.toBase58() === JUPITER_V6_PROGRAM_ID
  );

  if (!jupiterInstruction) {
    throw new Error(
      "No jupiter instruction found in the transaction, was it created via /swap?"
    );
  }

  // TBD
  const transferInstructions = decodedInstructions.filter(
    (instruction) => instruction.type === "systemTransfer"
  );
  console.log({
    decodedInstructions,
    transferInstructions: transferInstructions[0].data,
  });

  let owners = [];
  if (transferInstructions.length > 0) {
    const accountsData = await Promise.all(
      transferInstructions.map((instruction) =>
        solanaApi.getAccountInfo(instruction.data.toPubkey)
      )
    );

    owners = accountsData.map((account) => account.owner);
  }

  const ab = instructionParser.getInAndOutAmounts([jupiterInstruction]);

  return {
    ...ab,
    owners,
  };
};

// const base64TransactionData =
//   "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHEnEFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyCCGP/EB23+TrlVGaWIyyyFGhfpkVZugj+8HY/grfA1hKW+R5sbYgVj8qiLTr4aKTOZunWL2wNcQdejzeAMhoGG4W91d2pdzUEPxLmDjV21GXaL4M6y1PA1voDK7/q0dph7Uj+ncbLnnXrncZ0M9fcpfQPh1Y9fJm+wF6ZvdeXAecGzJrCZxDIwtKtVHyjv75vJQe8cvEL9m7bNTO4oxerrUUipMzi8CShVjAG9xx5AQwTg5UMM0U25fL5xbpLZS3w0AKZf83ZsMb7wHrKRBfNI6Q+Umh9gwz6TsuMr8np7TJD7R7MrykQ+ZBtfBnxPPc7nb9gAKhPbS/SITgDsPVtN98WEPD+gf4+4FB1muMC+gCWv8y3vpmYTDusMu6aGBP9JXopPY5L9d+tnaIZjNyCJX8sUL3snd3L4/2yF45wKsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAABHnVW/IxwG7udMVuzmgVB/2xst6j9I5RArHNola8E48G3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqYKX5UT/REBqE7f6ZMLP+j7G4V34k14Ax0Fw3q7wE/N9jJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+Fm0P/on9df2SnTAmx8pWHneSwmrNt/J3VFLMhqns4zl6JlzzGIbQ/h8ud+W3wt4exIn9uhUGnXBhVblt1ksY+8pBwwABQLAXBUADAAJAwQXAQAAAAAAEAYABQAfCw4BAQsCAAUMAgAAABNaLwQAAAAADgEFARENOw4PAAUECgYfJgcNEQ0jGSMYFgQIHyUXIw8ODiQjAgEDDSgnGw8ICR0cGh4OKispISATFAoJFRIPIg4NLcEgmzNB1pyBBgMAAAAmZAABGWQBAhIAZAIDE1ovBAAAAADiR5cAAAAAAMgAVQ4DBQAAAQkDGbsIyLJsYYdbyL8yjviU3vsNvxY5X5NSTo2OQ6zTwowEIBsZHAQsHxcdR2RvASBPDyQ4Vj7qqZ/Un04uGpL0gmT9xn8RbtPLAQgE9fn09wR5dPZzs5REVmID5dhx3eCRpJ7vc4qAfNlwSCRZfc4gCNv0gAgFLCguLTAFJyIvKxY=";
const base64TransactionData =
  "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHD3EFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyOAHIkXP+jIl40CFgl+ft6tNmzrEkeOe4BXS/9y4fqJA9t1pWG6qWtPmFmciR1xbrt4IW+b1nNcz2N5abYbCcsFADLL1zkJzVmaQIzSY+ENLjwa+LkcC92gQApzi7UU4MZ0EED+QHqrBQRqB+cbMfYZjXZcTe9r+CfdbguirL8P6cGzJrCZxDIwtKtVHyjv75vJQe8cvEL9m7bNTO4oxerqLzz52eQbJCPxLYiSm4iaKNc8ncsyvelkk2GmiDnfwWuAcMGg4jPq0aZZP6v3Brdi2qi4si/TX8grKcaVzhOcQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAABHnVW/IxwG7udMVuzmgVB/2xst6j9I5RArHNola8E48G3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqVE+LF26QsO9gzDavYNO6ZflUDWJ+gBV9eCQ5OcuzAMSjJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+Fm0P/on9df2SnTAmx8pWHneSwmrNt/J3VFLMhqns4zl6EBc4PGS1k+aRV3SB6pvqgtLDN0j7tnUF/HL7U58jShwBwkABQLAXBUACQAJAwQXAQAAAAAADQYABQAeCAsBAQgCAAUMAgAAAOhq3wMAAAAACwEFAREKPQsMAAUEAgYeJAMKDgodEx0PEAQHHx4RHQwLCyAdEgoiIRcVBwEUFgwjCwodGh0YHAECJCUZHQwLCyAdGwotwSCbM0HWnIEDAwAAACZkAAESAWQBAiZkAgPoat8DAAAAAJNfmAAAAAAAyABVCwMFAAABCQO2EQH3pX6jHRIeCR18elUtxl6cnloTSkJQbMfZtiPHPgUTEhARWgQPWFtZ70cJSZx3usgQE28gD08xGFASErdDSjRf7Zy1CStpJFsEuLS2mgOZmLN4v8D6Ccv8yXNcO0Dn7waISjBP1gziKggY0opcgUhDYgVNRUxHSgJGSA==";
// const base64TransactionData = // USDT_USDC (both with accounts)
//   "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAEEXEFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyOAHIkXP+jIl40CFgl+ft6tNmzrEkeOe4BXS/9y4fqJA9t1pWG6qWtPmFmciR1xbrt4IW+b1nNcz2N5abYbCcsFADLL1zkJzVmaQIzSY+ENLjwa+LkcC92gQApzi7UU4MZ0EED+QHqrBQRqB+cbMfYZjXZcTe9r+CfdbguirL8P5wccDT11PCgZnvGncl43WttfK2QUfCBVUqNg8vpBi7S6Lzz52eQbJCPxLYiSm4iaKNc8ncsyvelkk2GmiDnfwWqLLQ4QY0S20HU2ioqmnunsWIpHYgUUVifOcbOi5XS4G1FIqTM4vAkoVYwBvcceQEME4OVDDNFNuXy+cW6S2Ut8vn9OrsRN5WGo5O0KGH+kUfP54SEFTJB+XRUy9zr/OA4ZWfB9W4WUYCPmmlGfUoQYDeNJ4ho9EhZbnW0SQ8gV35ggXE8lq9F4Ue/Xz13zhVO7Rk2BMaHpOcw+5Yfw3xZP0ZQs82cZwfAHVYuZabsim+gfg2/q6UZtmyv9Axe1dKAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTj1E+LF26QsO9gzDavYNO6ZflUDWJ+gBV9eCQ5OcuzAMStD/6J/XX9kp0wJsfKVh53ksJqzbfyd1RSzIap7OM5ejV+FW9kT1FbtsbZnfsI9dAHluNnJpQCjg9vGX8fUifDQMNAAUCwFwVAA0ACQMEFwEAAAAAAA5DIg8ACAECBiYlAw4QDiESIRQVAQsjJhMhDyIiJCEKEQ4hFyEWGwsEIycZIQ8iIiQhGhgMDikPKB8EAiAcHiIFHQcJDizBIJszQdacgQMDAAAAJmQAASZkAQIaZAIDCJuYAAAAAADJf5cAAAAAAMgAVQMpVW5DdBx5X8Mcy+PdG17z3KX3qcXXoa6ioOrHVKDHtQWJioSIKgYxAYstLCuRNNJpQW795y2I8tipRQO4oifrnZXMjY8ChvqeXfrCbgZXLTBVVC4BLHr60BRSgD2xDk9lOwWoO5wdTzQDXCyoyoVBYRNWXBV3BYF5foB/Ant6";
// const base64TransactionData = // USDC_SOL
//   "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHEHEFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyHmgu1XLvyv0NCSDcWUDoO1ixNeXGBEvvDIw4Wt3UhMpd+Fpi3a/C7y3gYqbv5eFboXM2psPs5aLjqdyOevltB2yb5gSqKLHZe05XNykCIa3kTNICscYM+1nTytzdqMEac0arIcmMut95oKzu30+1mfPlq0paFIePEE7wlIMAnkyHtSP6dxsuedeudxnQz19yl9A+HVj18mb7AXpm915cB5wbMmsJnEMjC0q1UfKO/vm8lB7xy8Qv2bts1M7ijF6uovPPnZ5BskI/EtiJKbiJoo1zydyzK96WSTYaaIOd/BbJD7R7MrykQ+ZBtfBnxPPc7nb9gAKhPbS/SITgDsPVtAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpgpflRP9EQGoTt/pkws/6PsbhXfiTXgDHQXDervAT832MlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WbQ/+if11/ZKdMCbHylYed5LCas238ndUUsyGqezjOXoE7IVhZKrZk1ySdb+ova9S1/MCtdyb2gghwUhDx9p1V4FCgAFAsBcFQAKAAkDBBcBAAAAAAAOBgAGABUJDAEBCyEMDQAHCAUGFxUCCw8LFBEUEBMIBRUXEhQNDAwWFAEEAwskwSCbM0HWnIEGAQAAACZkAAGAlpgAAAAAABr1ZwQAAAAAyABVDAMGAAABCQE6fnT5EMQH6F/5gvVNINP3D+rl7aVx930qfnU5NUThOgTz+vj8BPv99fY=";
// const base64TransactionData = // SOL_USDC
//   "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAJEnEFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyAT+y2A3mO/VPEKYN1tVf0qaU6GJv+FZk20zbMpbSS+lGCfaNjc6t8mmARB9ov0laqBWBnyNhK77UktLOTfLaG1ADLL1zkJzVmaQIzSY+ENLjwa+LkcC92gQApzi7UU4MZn/LU4VSNrEZJg9hJjEvfwMjmNLCvJDpEyG0zH7Y1yRpkDmYP35915EQeYrHl3MRADgAzguO5n3mHt1eOVYSGnEzfZHfK+df8cHOiMH18Ck85+5FYvbuPgRfoH+q0xHdnBsyawmcQyMLSrVR8o7++byUHvHLxC/Zu2zUzuKMXq6i88+dnkGyQj8S2IkpuImijXPJ3LMr3pZJNhpog538FgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwabiFf+q4GE+2h/Y0YYwDXaxDncGus7VZig8AAAAAABBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKmMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WZqAC/9MhzaIlsIPwUBz6/HLWqN1/oH+Tb3IK6Tft154tD/6J/XX9kp0wJsfKVh53ksJqzbfyd1RSzIap7OM5ejG+nrzvtutOj1l82qryXQxsbvkwtL24OR8pgIDRS9dYVYtpZW1iFONCYHRTma52y/Wi+X9k9kox5wN6cVbJ8ngBwoABQLAXBUACgAJAwQXAQAAAAAADgYABwAMCQ0BAQkCAAcMAgAAABW0cAQAAAAADQEHARELHA0PAAcGBAgMEQMLEAsYDxcVBgQTFBINAhYBBQskwSCbM0HWnIECAQAAABpkAAEVtHAEAAAAAChplwAAAAAAyABVDQMHAAABCQGztn6UefHtBMN7Xr1WjqnqteTOlxanK8W3YqPKx0pGaQVfXGZdYQJeZQ==";
decodeTransaction(base64TransactionData).then(console.log);
