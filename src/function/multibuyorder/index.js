/* eslint-disable no-undef */
const ethers = require("ethers");
const { storage, log, getTxAmount } = require("../../utils");

const {
  mode,
  Buy_Method,
  Buy_Bsc_Token_Contract,
  Test_Buy_Bsc_Token_Contract,
  Amount_Of_Tokens_To_Buy,
  Gas_Limit,
  Buy_Slippage,
  Rounds_To_Buy,
  Delay_Between_Buy_Rounds,
  Seconds_Delay_Before_1st_Buy,
  Block_Delay_Before_1st_Buy,
  Amount_Of_Max_WBNB_To_Buy,
  Send_To_Different_Wallet,
  Receiver_Wallet,
  Approve_Contract,
  Sell,
  Sell_Bsc_Token_Contract,
  Test_Sell_Bsc_Token_Contract,
  Sell_On_Percentage_Gain,
  Stop_Listening_On_Liq_Change_Detected,
} = require("../../../Trade_variables");
const { handleSellToken } = require("../../utils/promptTokenA");
const MultiSellOrder = require("../multisellorder");
const { handleWebsocket } = require("../../utils/promptTokenA");

const { pcs, testpcs, wbnb, testwbnb } = require("../../constant");
const pcsAbi = new ethers.utils.Interface(require("../../abi/pcrouter.json"));

const provider = new ethers.providers.WebSocketProvider(
  handleWebsocket(mode)
);

let buyInterval = null;
let multiCount = 0;
let failCount = 0;
let tokenPriceOnFirstBuy = 0;

/**
 * @param {number}  decimals  decimals
 * Get the token price
 */
const getTokenPrice = async (TokenA, decimals) => {
  const provider = new ethers.providers.WebSocketProvider(
    handleWebsocket(mode)
  );
  const router = new ethers.Contract(mode % 2 != 0 ?pcs : testpcs, pcsAbi, provider);
  const realwbnb = mode % 2 != 0 ? wbnb : testwbnb;
  const price = ethers.utils.formatUnits(
    TokenA.toLowerCase() === realwbnb.toLowerCase()
      ? (
        await router.getAmountsOut(ethers.utils.parseUnits("1", decimals), [
          handleSellToken(mode),
          realwbnb,
        ])
      )[1]
      : (
        await router.getAmountsOut(ethers.utils.parseUnits("1", decimals), [
          handleSellToken(mode),
          TokenA,
          realwbnb,
        ])
      )[2],
    18
  );
  return Number(price).toFixed(18);
};

const sellAfterBuy = async (TokenA, optionMenu, decimals) => {
  if (Sell_On_Percentage_Gain != 0) {
    console.log("Starting on percentage gain...");
    console.log("Original price(BNB): ", tokenPriceOnFirstBuy);
    log.writeLog(
      `Starting on percentage gain...\nOriginal price: ${tokenPriceOnFirstBuy}`
    );
    let interval = setInterval(async () => {
      const currentTokenPrice = await getTokenPrice(TokenA, decimals);
      const percentChanged =
        (currentTokenPrice / tokenPriceOnFirstBuy - 1) * 100;
      console.log(
        new Date().toISOString(),
        `Current price(BNB):`,
        currentTokenPrice,
        "Percent changed:",
        percentChanged + "%"
      );
      if (percentChanged >= Sell_On_Percentage_Gain) {
        console.log(`Token price detecting ${currentTokenPrice}...`);
        MultiSellOrder(
          Stop_Listening_On_Liq_Change_Detected
            ? () => {
              optionMenu();
            }
            : null,
          TokenA
        );
        clearInterval(interval);
      }
    }, 1000);
  }
};

/**
 * Buy the exact amount of token, Send token the exact wallet.
 * @param {string} address        Wallet address
 * @param {string} pKey           Wallet private key
 * @param {string} name           Wallet anme
 * @param {number} index          Transaction index
 * @param {number} scope          Number of buy
 * @param {number} gas_price      Gas price for buting
 * @param {string} TokenA         A token for swap
 * @param {function} optionMenu   Option Menu
 * @param {bool}  allowApprove    Permission approve token
 */

const { handleBuyToken } = require("../../utils/promptTokenA");
const simpleBuy = async (
  { address, pKey, name },
  index,
  scope,
  gas_price,
  TokenA,
  optionMenu,
  allowApprove
) => {
  const wallet = new ethers.Wallet(pKey);
  const account = wallet.connect(provider);
  const router = new ethers.Contract(mode % 2 != 0 ? pcs : testpcs, pcsAbi, account);
  const approve = new ethers.Contract(
    handleBuyToken(mode),
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
    const decimals = await approve.decimals();
    const realwbnb = mode % 2 != 0 ? wbnb : testwbnb;
    if (index === 1)
      tokenPriceOnFirstBuy = await getTokenPrice(TokenA, decimals);
    const pairs =
      TokenA == null || realwbnb.toLowerCase() == TokenA.toLowerCase()
        ? [realwbnb, handleBuyToken(mode)]
        : [
          realwbnb,
          TokenA,
          handleBuyToken(mode)
        ];
    const tx = Buy_Method
      ? await router.swapTokensForExactTokens(
        ethers.utils.parseUnits(Amount_Of_Tokens_To_Buy.toString(), decimals),
        ethers.constants.MaxUint256,
        pairs,
        !Send_To_Different_Wallet ? address : Receiver_Wallet,
        Date.now() + 1000 * 60 * 5,
        {
          gasLimit: Gas_Limit.toString(),
          gasPrice: ethers.utils.parseUnits(gas_price.toString(), "gwei"),
        }
      )
      : await router.swapExactTokensForTokens(
        ethers.utils.parseUnits(Amount_Of_Max_WBNB_To_Buy.toString(), 18),
        0,
        pairs,
        !Send_To_Different_Wallet ? address : Receiver_Wallet,
        Date.now() + 1000 * 60 * 5,
        {
          gasLimit: Gas_Limit.toString(),
          gasPrice: ethers.utils.parseUnits(gas_price.toString(), "gwei"),
        }
      );
    const log1 = `${new Date().toISOString()} ${name} Buying ${symbol} with a Buy_Slippage of ${Buy_Slippage}%`;
    console.log(log1);
    const log2 = `${new Date().toISOString()} ${name} Buy order ${index} send: ${tx.hash
      }`;
    console.log(log2);
    log.writeLog(`${log1}\n${log2}`);
    const receiptet = await tx.wait();
    // const log3 = `${new Date().toISOString()} ${name} Buy order ${index} confirmed: https://${mode ? "bscscan" : "testnet.bscscan"
    //   }.com/tx/${receiptet.transactionHash}`;
    // console.log(log3);
    const amountOut = await getTxAmount(receiptet, decimals);
    const log4 = `${new Date().toISOString()} ${name} order ${index} ${amountOut}${symbol} minted`;
    console.log(log4);
    log.writeLog(`${log3}\n${log4}`);
    //  approve
    if (Approve_Contract && allowApprove) {
      const log5 = `${new Date().toISOString()} ${name} Approving ${symbol}`;
      console.log(log5);
      const appr = await approve.approve(
        router.address,
        ethers.constants.MaxUint256,
        {
          gasLimit: Gas_Limit.toString(),
          gasPrice: ethers.utils.parseUnits(gas_price.toString(), "gwei"),
        }
      );
      const log6 = `${new Date().toISOString()} ${name} Approve ${symbol} order: ${appr.hash
        }`;
      console.log(log6);
      log.writeLog(`${log5}\n${log6}`);
      // const receiptet = await appr.wait();
      // const log3 = `${new Date().toISOString()} ${name} Approve ${symbol} order confirmed: https://${mode ? "bscscan" : "testnet.bscscan"
      //   }.com/tx/${receiptet.transactionHash}`;
      // console.log(log3);
      // log.writeLog(`${log3}`);
    }
    multiCount++;
    if (multiCount == scope) {
      if (Sell) sellAfterBuy(TokenA, optionMenu, decimals);
      else if (optionMenu != null) optionMenu();
    }
  } catch (e) {
    const log_error = `${new Date().toISOString()} ${name} Error: "${e.reason
      }"`;
    console.log(log_error);
    log.writeLog(log_error);
    multiCount++;
    failCount++;
    if (multiCount == scope) {
      if (Sell) {
        if (failCount == scope && Stop_Listening_On_Liq_Change_Detected) {
          optionMenu();
        } else sellAfterBuy(TokenA, optionMenu);
      } else if (optionMenu != null) optionMenu();
    }
  }
};

/**
 * Buy tokens with multi wallets
 * @param {array} wallets         Target wallet list
 * @param {function} optionMenu   Option Menu
 * @param {number} gas_price      Gas price
 * @param {string} TokenA         A token for swap
 */
const multiBuy = async (wallets, optionMenu, gas_price, TokenA) => {
  multiCount = 0;
  failCount = 0;
  tokenPriceOnFirstBuy = 0;

  let buyList = [];
  for (let wallet of wallets) {
    buyList.push((index, allowApprove = false) => {
      simpleBuy(
        wallet,
        index,
        wallets.length * Rounds_To_Buy,
        gas_price,
        TokenA,
        optionMenu,
        allowApprove
      );
    });
  }
  let number = 1;
  let delay_time = 0;
  if (Seconds_Delay_Before_1st_Buy > 0) {
    let logStr = `${new Date().toISOString()} Will delay ${Seconds_Delay_Before_1st_Buy}s ...`;
    console.log(logStr);
    log.writeLog(logStr);
    delay_time = Seconds_Delay_Before_1st_Buy;
  } else if (Block_Delay_Before_1st_Buy > 0) {
    let logStr = `${new Date().toISOString()} Will skip ${Block_Delay_Before_1st_Buy} blocks : ${await provider.getBlockNumber()}`;
    console.log(logStr);
    log.writeLog(logStr);
    delay_time = Block_Delay_Before_1st_Buy * 1;
  }
  if (Rounds_To_Buy >= 1) {
    setTimeout(async () => {
      Promise.all(
        buyList.map((buy) => buy(number, Rounds_To_Buy === 1 ? true : false))
      );
      buyInterval = setInterval(async () => {
        if (number === Rounds_To_Buy) {
          clearInterval(buyInterval);
        } else {
          if (number <= Rounds_To_Buy - 1) {
            logStr = `${new Date().toISOString()} Will delay ${Delay_Between_Buy_Rounds}s...`;
            console.log(logStr);
            log.writeLog(logStr);
          }
          Promise.all(
            buyList.map((buy) =>
              buy(number + 1, number === Rounds_To_Buy - 1 ? true : false)
            )
          );
          number++;
        }
      }, Delay_Between_Buy_Rounds * 1000);
    }, delay_time * 1000);
  } else {
    console.log("The rounds of buy is zero.");
    optionMenu();
  }
};

module.exports = async (optionMenu = null, gas_price, TokenA = null) => {
  console.log("Starting multi buy orders!");
  log.writeLog("Starting multi buy orders!");
  multiBuy(storage.getStorageValue("wallets"), optionMenu, gas_price, TokenA);
};
