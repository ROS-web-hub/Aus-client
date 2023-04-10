/* eslint-disable no-undef */
const ethers = require("ethers");

const {
  mode,
  Sell_Bsc_Token_Contract,
  Test_Sell_Bsc_Token_Contract,
  Sell,
  Sell_Quantity_Of_Tokens,
  websocket,
  test_Bsc_Websocket,
  Sell_Slippage,
  Gas_Limit,
  Sell_Gas_Price,
  Send_To_Different_Wallet,
  Receiver_Wallet,
} = require("../../../Trade_variables");
const { handleWebsocket } = require("../../utils/promptTokenA");

const { pcs, testpcs, wbnb, testwbnb } = require("../../constant");

const { storage, getTxAmount, log } = require("../../utils");

const provider = new ethers.providers.WebSocketProvider(
  handleWebsocket(mode)
);
const pcsAbi = new ethers.utils.Interface(require("../../abi/pcrouter.json"));

/**
 * Sell token with an wallet
 * @param {string} address  wallet address
 * @param {string} pKey     wallet private key
 * @param {string} name     wallet name
 * @param {string} TokenA    A token for swap
 */

const { handleSellToken } = require("../../utils/promptTokenA");
const simpleSell = async ({ address, pKey, name }, TokenA) => {
  const wallet = new ethers.Wallet(pKey);
  const account = wallet.connect(provider);
  const router = new ethers.Contract(mode % 2 != 0 ? pcs : testpcs, pcsAbi, account);

  const approve = new ethers.Contract(
    handleSellToken(mode),
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
    let sellAmount = await approve.balanceOf(address);
    if (sellAmount.toString() != "0") {
      sellAmount = ethers.BigNumber.from(sellAmount)
        .div("100")
        .mul(Sell_Quantity_Of_Tokens.toString());
      const realwbnb = mode % 2 != 0 ? wbnb : testwbnb;
      const tx =
        await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
          sellAmount,
          0,
          TokenA == null || realwbnb.toLowerCase() == TokenA.toLowerCase()
            ? [handleSellToken(mode), realwbnb]
            : [handleSellToken(mode),
              TokenA,
            mode % 2 != 0 ? wbnb : testwbnb,
            ],
          !Send_To_Different_Wallet ? address : Receiver_Wallet,
          Date.now() + 1000 * 60 * 5,
          {
            gasLimit: Gas_Limit.toString(),
            gasPrice: ethers.utils.parseUnits(
              Sell_Gas_Price.toString(),
              "gwei"
            ),
          }
        );
      const log1 = `${new Date().toISOString()} Selling ${symbol} with a Sell_Slippage of ${Sell_Slippage}%`;
      console.log(log1);
      const log2 = `${new Date().toISOString()} ${name} Sell order send: ${tx.hash
        }`;
      console.log(log2);
      log.writeLog(`${log1}\n${log2}`);
      const receiptet = await tx.wait();
      // const log3 = `${new Date().toISOString()} ${name} Sell order confirmed: https://${mode ? "bscscan" : "testnet.bscscan"
      //   }.com/tx/${receiptet.transactionHash}`;
      // console.log(log3);
      // log.writeLog(log3);
      // Transfer value
      const amountOut = await getTxAmount(receiptet, 18);
      const log4 = `${new Date().toISOString()} ${name} ${amountOut} WBNB got`;
      console.log(log4);
      log.writeLog(log4);
    } else {
      console.log(`${new Date().toISOString()} There is no tokens in wallet`);
      writeLog(`${new Date().toISOString()} There is no tokens in wallet`);
    }
  } catch (e) {
    const log_error = `${new Date().toISOString()} ${name} Error: "${e.reason
      }"`;
    console.log(log_error);
    log.writeLog(log_error);
    log.writeLog(e);
  }
};
/**
 * Sell multi wallets
 * @param {array} wallets     Wallet list
 * @param {string} TokenA     A token for swap
 */
const multiSell = async (wallets, TokenA) => {
  let sellList = [];
  for (let wallet of wallets) {
    sellList.push(() => simpleSell(wallet, TokenA));
  }
  await Promise.all(sellList.map((sell) => sell()));
};

module.exports = async (optionMenu = null, TokenA = null) => {
  if (!Sell) {
    let logStr = "No Permission to sell.";
    console.log(logStr);
    log.writeLog(logStr);
  } else {
    let logStr = "Starting multi sell orders!";
    console.log(logStr);
    log.writeLog(logStr);
    await multiSell(storage.getStorageValue("wallets"), TokenA);
  }
  if (optionMenu != null) optionMenu();
};
