const test = require('node:test');
const assert = require('node:assert/strict');

const { isTrustedIpcSender } = require('../src/ipc-security');

export { };

test('isTrustedIpcSender accepts only the trusted webContents main frame', () => {
  const mainFrame = {};
  const trustedWebContents = { mainFrame };

  assert.equal(isTrustedIpcSender({
    sender: trustedWebContents,
    senderFrame: mainFrame,
  }, trustedWebContents), true);
  assert.equal(isTrustedIpcSender({
    sender: trustedWebContents,
    senderFrame: {},
  }, trustedWebContents), false);
  assert.equal(isTrustedIpcSender({
    sender: { mainFrame },
    senderFrame: mainFrame,
  }, trustedWebContents), false);
  assert.equal(isTrustedIpcSender({
    sender: trustedWebContents,
    senderFrame: mainFrame,
  }, null), false);
});
