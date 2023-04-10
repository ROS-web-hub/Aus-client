/* eslint-disable no-undef */
const ethers = require("ethers");
const prompt = require("prompt-sync")({ sigint: true });
const { storage, log } = require("../../utils");

let {
  mode,
  Gas_Limit,
  Approve_Gas_Price,
  bsc_Websocket,
  eth_Websocket,
  test_Eth_Websocket,
  test_Bsc_Websocket,
} = require("../../../Trade_variables");

const { handleBuyToken } = require("../../utils/promptTokenA");

let { pcs, wbnb, testpcs, testwbnb } = require("../../constant");

function handleWebsocket(mode) {
  switch (mode) {
    case 0: return test_Bsc_Websocket;
    case 1: return bsc_Websocket;
    case 2: return test_Eth_Websocket;
    default: return eth_Websocket;
  }
}

const pcsAbi = new ethers.utils.Interface(require("../../abi/pcrouter.json"));
const provider = new ethers.providers.WebSocketProvider(
  handleWebsocket(mode)
);

/**
 * Approve the exact token
 * @param {string} wallet         name
 * @param {string} wallet         private key
 * @param {string} approveToken   token address for approve
 */
const simpleApprove = async ({ name, pKey }, approveToken) => {
  const wallet = new ethers.Wallet(pKey);
  const account = wallet.connect(provider);
  console.log(await provider.getBlockNumber());
  const router = new ethers.Contract(mode % 2 != 0  ? pcs : testpcs, pcsAbi, account);

  const approve = new ethers.Contract(
    approveToken,
    [
      "function approve(address spender, uint amount) public returns(bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
      "function name() view returns (string)",
      "function symbol() view returns (string)",
    ],
    account
  );
  try {
    const symbol = await approve.symbol();
    const log1 = `${new Date().toISOString()} ${name} Approving ${symbol}`;
    console.log(log1);
    const appr = await approve.approve(
      router.address,
      ethers.constants.MaxUint256,
      {
        gasLimit: Gas_Limit.toString(),
        gasPrice: ethers.utils.parseUnits(Approve_Gas_Price.toString(), "gwei"),
      }
    );
    const log2 = `${new Date().toISOString()} ${name} Approve ${symbol} order: ${appr.hash}`;
    console.log(log2);
    log.writeLog(`${log1}\n${log2}`);
    const receiptet = await appr.wait();

    // function handleNetwork(mode) {
    //   switch (mode) {
    //     case 0: return "https://testnet.bscscan.com";
    //     case 1: return "https://bscscan.com";
    //     case 2: return "https://goerli.net";
    //     default: return "https://sepolia.etherscan.io";
    //   }
    // };
    // const log3 = `${new Date().toISOString()} ${name} Approve ${symbol} order confirmed: https://${mode ? "bscscan" : "testnet.bscscan"}.com/tx/${receiptet.transactionHash}`;
    // console.log(log3);
    // log.writeLog(`${log3}`);
  } catch (e) {
    const log_error = `${new Date().toISOString()} ${name} Error: "${e.reason
      }"`;
    console.log(log_error);
    log.writeLog(log_error);
  }
};

/**
 * Approve multi wallets
 * @param {array} wallets     Wallet list
 * @param {string} contract   Contract Address to approve
 */
const multiApprove = async (wallets, contract) => {
  let approveList = [];
  for (let wallet of wallets) {
    approveList.push(() => simpleApprove(wallet, contract));
  }
  await Promise.all(approveList.map((approve) => approve()));
};



const main = async () => {
  console.log(" 1) WBNB Approve \n 2) Token Approve");
  const menu = prompt("Please select an approve option: ");
  switch (menu) {
    case "1":
      console.log("Starting multi approve orders!");
      log.writeLog(
        `Please select an approve option: WBNB \nStarting multi approve orders!`
      );
      await multiApprove(
        storage.getStorageValue("wallets"),
        mode % 2 != 0 ? wbnb : testwbnb
      );
      break;
    case "2":
      console.log("Starting multi approve orders!");
      log.writeLog(
        `Please select an approve option: Token \nStarting multi approve orders!`
      );
      await multiApprove(
        storage.getStorageValue("wallets"),
        handleBuyToken(mode)
      );
      break;
    default:
      main();
      break;
  }
};

module.exports = async (optionMenu) => {
  await main();
  optionMenu();
};
