// wallet list with address & PK
const WALLETS = [
  {
    name: "bot",
    address: "0x7F518EBBF7Ea19675f9c8B0cf8887e30C9ABa9E2",
    pKey: "9cda195c676fd0bc6e0f38443b8e243b217aec8b0471c78be3b291f6a36d9f9e",
  },
  {
    name: "test1",
    address: "0xaC999fdBC7E8465596c8EC991fB38996F60294CE",
    pKey: "0296684b6ab4af7f2a03169b0099ccc94dce8bb6e150ba9c83ec1923d9cef30f",
  },
  {
    name: "test2",
    address: "0x19704D3aF48F0fCFe2C6B3cf63CA64f7c2188Fb8",
    pKey: "B44f407ebe964c4e016be993168521519a1278a393bed90970bae2f3cc6f0012",
  },
];

const EXPECTED_PONG_BACK = 10;
const KEEP_ALIVE_CHECK_INTERVAL = 15;

module.exports = { WALLETS, EXPECTED_PONG_BACK, KEEP_ALIVE_CHECK_INTERVAL };
