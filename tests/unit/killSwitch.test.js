const { KillSwitch } = require("../../src/killSwitch");

describe("kill switch (unit)", () => {
  test("KillSwitch toggles enable/disable", () => {
    const ks = new KillSwitch();
    expect(ks.isEnabled()).toBe(false);
    ks.enable();
    expect(ks.isEnabled()).toBe(true);
    ks.disable();
    expect(ks.isEnabled()).toBe(false);
  });
});
