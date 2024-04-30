const decodeTransaction = require(".");

describe("instruction decoder", () => {
  it("should decode USDC_SOL tx", async () => {
    const base64TransactionData = // USDC_SOL
      "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHEHEFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyHmgu1XLvyv0NCSDcWUDoO1ixNeXGBEvvDIw4Wt3UhMpd+Fpi3a/C7y3gYqbv5eFboXM2psPs5aLjqdyOevltB2yb5gSqKLHZe05XNykCIa3kTNICscYM+1nTytzdqMEac0arIcmMut95oKzu30+1mfPlq0paFIePEE7wlIMAnkyHtSP6dxsuedeudxnQz19yl9A+HVj18mb7AXpm915cB5wbMmsJnEMjC0q1UfKO/vm8lB7xy8Qv2bts1M7ijF6uovPPnZ5BskI/EtiJKbiJoo1zydyzK96WSTYaaIOd/BbJD7R7MrykQ+ZBtfBnxPPc7nb9gAKhPbS/SITgDsPVtAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpgpflRP9EQGoTt/pkws/6PsbhXfiTXgDHQXDervAT832MlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WbQ/+if11/ZKdMCbHylYed5LCas238ndUUsyGqezjOXoE7IVhZKrZk1ySdb+ova9S1/MCtdyb2gghwUhDx9p1V4FCgAFAsBcFQAKAAkDBBcBAAAAAAAOBgAGABUJDAEBCyEMDQAHCAUGFxUCCw8LFBEUEBMIBRUXEhQNDAwWFAEEAwskwSCbM0HWnIEGAQAAACZkAAGAlpgAAAAAABr1ZwQAAAAAyABVDAMGAAABCQE6fnT5EMQH6F/5gvVNINP3D+rl7aVx930qfnU5NUThOgTz+vj8BPv99fY=";
    const { inAmount, outputAmount, owners } = await decodeTransaction(
      base64TransactionData
    );

    expect(inAmount.toString()).toBe("10000000");
    expect(outputAmount.toString()).toBe("73921818");
    expect(owners).toEqual([]);
  });

  it("should decode SOL_USDC tx", async () => {
    const base64TransactionData = // SOL_USDC
      "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAJEnEFiG4DTZRCbmnlsIoI3aN48Z+uAD3YHPdxGxDNU+kyAT+y2A3mO/VPEKYN1tVf0qaU6GJv+FZk20zbMpbSS+lGCfaNjc6t8mmARB9ov0laqBWBnyNhK77UktLOTfLaG1ADLL1zkJzVmaQIzSY+ENLjwa+LkcC92gQApzi7UU4MZn/LU4VSNrEZJg9hJjEvfwMjmNLCvJDpEyG0zH7Y1yRpkDmYP35915EQeYrHl3MRADgAzguO5n3mHt1eOVYSGnEzfZHfK+df8cHOiMH18Ck85+5FYvbuPgRfoH+q0xHdnBsyawmcQyMLSrVR8o7++byUHvHLxC/Zu2zUzuKMXq6i88+dnkGyQj8S2IkpuImijXPJ3LMr3pZJNhpog538FgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwabiFf+q4GE+2h/Y0YYwDXaxDncGus7VZig8AAAAAABBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKmMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WZqAC/9MhzaIlsIPwUBz6/HLWqN1/oH+Tb3IK6Tft154tD/6J/XX9kp0wJsfKVh53ksJqzbfyd1RSzIap7OM5ejG+nrzvtutOj1l82qryXQxsbvkwtL24OR8pgIDRS9dYVYtpZW1iFONCYHRTma52y/Wi+X9k9kox5wN6cVbJ8ngBwoABQLAXBUACgAJAwQXAQAAAAAADgYABwAMCQ0BAQkCAAcMAgAAABW0cAQAAAAADQEHARELHA0PAAcGBAgMEQMLEAsYDxcVBgQTFBINAhYBBQskwSCbM0HWnIECAQAAABpkAAEVtHAEAAAAAChplwAAAAAAyABVDQMHAAABCQGztn6UefHtBMN7Xr1WjqnqteTOlxanK8W3YqPKx0pGaQVfXGZdYQJeZQ==";

    const { inAmount, outputAmount, owners } = await decodeTransaction(
      base64TransactionData
    );

    expect(inAmount.toString()).toBe("74494997");
    expect(outputAmount.toString()).toBe("9922856");
    expect(owners).toEqual(["CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK"]);
  });
});
