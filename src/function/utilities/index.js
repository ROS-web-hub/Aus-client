const ethers = require("ethers");
const axios = require("axios");
const prompt = require("prompt-sync")({ sigint: true });

const { mode } = require("../../../Trade_variables");
const { log, storage } = require("../../utils");
const { handleWebsocket } = require("../../utils/promptTokenA");

const provider = new ethers.providers.WebSocketProvider(
  handleWebsocket(mode)
);

const BITQUERY_API_KEY = "BQYhStr5giLYcUfYNX3bjMtHq1JovF7V";

/**
 * Return the data of all tokens in wallet
 * @param {string} address wallet address
 * @returns
 */

const handleNetwork = require("../../utils/promptTokenA");
const getAllTokens = async (address) => {
  const BITQUERY_OTHER_QUERY = `{S
    ethereum(network: ${handleNetwork(mode)}) {
        address(address: {is: "${address}"}) {
        balances {
            currency {
            tokenType
            address
            name
            symbol
            }
            value
        }
      }
    }
  }`;
  let { data } = await axios({
    url: "https://graphql.bitquery.io/",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": BITQUERY_API_KEY,
    },
    data: JSON.stringify({
      query: BITQUERY_OTHER_QUERY,
    }),
  });
  return data.data.ethereum.address[0].balances.sort((a, b) => {
    var ac = a.currency.name.toUpperCase();
    var bc = b.currency.name.toUpperCase();
    return ac > bc ? 1 : ac < bc ? -1 : 0;
  });
};

const getBalancesOfOther = async () => {
  const wallets = storage.getStorageValue("wallets");
  try {
    for (let wallet of wallets) {
      console.log(`----Wallet Name: ${wallet.name}----`);
      log.writeLog(`----Wallet Name: ${wallet.name}----`);
      const data = await getAllTokens(wallet.address);
      for (let token of data) {
        const { currency, value } = token;
        if (currency.tokenType == "ERC20" && currency.symbol != "WBNB") {
          console.log(`${currency.name}(${currency.symbol}): ${value}`);
          log.writeLog(`${currency.name}(${currency.symbol}): ${value}`);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const getBalancesOfMain = async () => {
  const wallets = storage.getStorageValue("wallets");
  for (let wallet of wallets) {
    console.log(`----Wallet Name: ${wallet.name}----`);
    log.writeLog(`----Wallet Name: ${wallet.name}----`);

    const logStr = `Binance Coin(BNB): ${ethers.utils.formatEther(
      await provider.getBalance(wallet.address)
    )}`;
    console.log(logStr);
    log.writeLog(logStr);
    const data = await getAllTokens(wallet.address);
    for (let token of data) {
      const { currency, value } = token;
      if (currency.symbol == "WBNB") {
        console.log(`${currency.name}(${currency.symbol}): ${value}`);
        log.writeLog(`${currency.name}(${currency.symbol}): ${value}`);
      }
    }
  }
};

const main = async (optionMenu) => {
  console.log(" 1) Balance of BNB & WBNB\n 2) Balance of Other Tokens");
  let menu = prompt("Please select an balance option: ");
  switch (menu) {
    case "1":
      log.writeLog("Please select an balance option: Balance of BNB & WBNB");
      await getBalancesOfMain();
      break;
    case "2":
      log.writeLog("Please select an balance option: Balance of Other Tokens");
      await getBalancesOfOther();
      break;
    default:
      main();
  }
  optionMenu();
};

module.exports = main;
