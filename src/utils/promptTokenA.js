const prompt = require("prompt-sync")({ sigint: true });
const {
  Test_Buy_Bsc_Token_Contract,
  Test_Sell_Eth_Token_Contract,
  Test_Sell_Bsc_Token_Contract,
  Sell_Bsc_Token_Contract,
  Sell_Eth_Token_Contract,
  Buy_Bsc_Token_Contract,
  Test_Buy_Eth_Token_Contract,
  Buy_Eth_Token_Contract,
  mode,
  bsc_Websocket,
  eth_Websocket,
  test_Eth_Websocket,
  test_Bsc_Websocket,
} = require("../../Trade_variables");

const handleWBNB = (mode) => {
  switch (mode) {
    case 0: return "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
    case 1: return "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
    case 2: return "";                //test-ethereum
    default: return "";               //main-ethereum
  }
}

const handleBUSD = (mode) => {
  switch (mode) {
    case 0: return "0x78867bbeef44f2326bf8ddd1941a4439382ef2a7";
    case 1: return "0xe9e7cea3dedca5984780bafc599bd69add087d56";
    case 2: return "";                //test-ethereum
    default: return "";               //main-ethereum
  }
}

const handleUSDT = (mode) => {
  switch (mode) {
    case 0: return "0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684";
    case 1: return "0x55d398326f99059fF775485246999027B3197955";
    case 2: return "";                //test-ethereum
    default: return "";               //main-ethereum
  }
}

const handleWebsocket = (mode) => {
  switch (mode) {
    case 0: return test_Bsc_Websocket;
    case 1: return bsc_Websocket;
    case 2: return test_Eth_Websocket;
    default: return eth_Websocket;
  }
}

const pairTokens = {
  1: handleWBNB(mode),
  2: handleBUSD(mode),
  3: handleUSDT(mode)
}

const menuTokenA = () => {
  let tokenA = null;
  console.log(" 1) BNB \n 2) BUSD \n 3) USDT");
  const menu = prompt("Please select a pair token: ");
  switch (menu) {
    case "1":
    case "2":
    case "3":
      tokenA = pairTokens[menu];
      break;
    default:
      menuTokenA();
      break;
  }
  return tokenA;
};

const handleBuyToken = (mode) => {
  switch (mode) {
    case 0: return Test_Buy_Bsc_Token_Contract;
    case 1: return Buy_Bsc_Token_Contract;
    case 2: return Test_Buy_Eth_Token_Contract;
    default: return Buy_Eth_Token_Contract;
  }
}

const handleTokenToLowerCase = (mode) => {
  let initToken;
  switch (mode) {
    case 0: initToken = Test_Buy_Bsc_Token_Contract.toLowerCase(); break;
    case 1: initToken = Buy_Bsc_Token_Contract.toLowerCase(); break;
    case 2: initToken = Test_Buy_Eth_Token_Contract.toLowerCase(); break;
    default: initToken = Buy_Eth_Token_Contract.toLowerCase(); break;
  }

  return initToken;
}

const handleSellToken = (mode) => {
  switch (mode) {
    case 0: return Test_Sell_Bsc_Token_Contract;
    case 1: return Sell_Bsc_Token_Contract;
    case 2: return Test_Sell_Eth_Token_Contract;
    default: return Sell_Eth_Token_Contract;
  }
}

const handleNetwork = (mode) => {
  switch (mode) {
    case 0: return "bsc_testnet";
    case 1: return "bsc";
    case 2: return "eth_testnet";
    default: return "eth";
  }
}

module.exports = { menuTokenA, handleWBNB, handleBUSD, handleWebsocket, handleBuyToken, handleTokenToLowerCase, handleSellToken, handleNetwork };
