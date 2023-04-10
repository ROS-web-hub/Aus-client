/* eslint-disable no-undef */
const ethers = require("ethers");

const {
  EXPECTED_PONG_BACK,
  KEEP_ALIVE_CHECK_INTERVAL,
} = require("../../../config");
const { pcs, wbnb, testpcs, testwbnb } = require("../../constant");
const {
  mode,
  Buy_Bsc_Token_Contract,
  Test_Buy_Bsc_Token_Contract,
  Sell_After_X_Seconds_From_Liquidity_Add_Detection,
  Stop_Listening_On_Liq_Change_Detected,
  Sell,
  Auto_Gas,
  Buy_Gas_Price,
} = require("../../../Trade_variables");
const { handleWebsocket } = require("../../utils/promptTokenA");

const pcsAbi = new ethers.utils.Interface(require("../../abi/pcrouter.json"));

/**
 * Main function to start websocket
 * @param {function} multiBuy   Multi Buy
 * @param {function} multiSell  Multi Sell
 */
const startWSS = async (multiBuy, multiSell) => {
  let isStopEverything = false;

  const provider = new ethers.providers.WebSocketProvider(
    handleWebsocket(mode)
  );
  let pingTimeout = null;
  let keepAliveInterval = null;
  provider._websocket.on("open", () => {
    keepAliveInterval = setInterval(() => {
      provider._websocket.ping();
      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, EXPECTED_PONG_BACK * 1000);
    }, KEEP_ALIVE_CHECK_INTERVAL * 1000);
    console.log("Scanning mempool...");
    provider.on("pending", async (txHash) => {
      provider.getTransaction(txHash).then(async (tx) => {
        if (tx && tx.to) {
          if (tx.to === (mode % 2 != 0 ? pcs : testpcs)) {
            let re = new RegExp("^0xf305d719"); //  addLiquidityETH
            let me = new RegExp("^0xe8e33700"); //  addLiquidity
            if (re.test(tx.data) || me.test(tx.data)) {
              const decodedInput = pcsAbi.parseTransaction({
                data: tx.data,
                value: tx.value,
              });
              const buy_token = mode
                ? Buy_Bsc_Token_Contract.toLowerCase()
                : Test_Buy_Bsc_Token_Contract.toLowerCase();
              try {
                if (
                  buy_token === decodedInput.args[0].toLowerCase() ||
                  buy_token === decodedInput.args[1].toLowerCase()
                ) {
                  const TokenA =
                    buy_token === decodedInput.args[0].toLowerCase()
                      ? typeof decodedInput.args[1] === "string"
                        ? decodedInput.args[1].toLowerCase()
                        : mode
                          ? wbnb
                          : testwbnb
                      : decodedInput.args[0].toLowerCase();
                  console.log(
                    new Date().toISOString(),
                    "Detect the add liquidity."
                  );
                  try {
                    if (!isStopEverything) {
                      if (Stop_Listening_On_Liq_Change_Detected) {
                        isStopEverything = true;
                      }
                      console.log("Starting buying...");
                      multiBuy(
                        Auto_Gas
                          ? ethers.utils.formatUnits(tx.gasPrice, "gwei")
                          : Buy_Gas_Price,
                        TokenA
                      );
                      if (
                        Sell &&
                        Sell_After_X_Seconds_From_Liquidity_Add_Detection != 0
                      ) {
                        console.log(
                          `Starting the timer for selling(${Sell_After_X_Seconds_From_Liquidity_Add_Detection}s)...`
                        );
                        setTimeout(() => {
                          console.log("Starting the selling...");
                          multiSell(TokenA);
                        }, Sell_After_X_Seconds_From_Liquidity_Add_Detection * 1000);
                      }
                    }
                  } catch (e) {
                    // console.log(e);
                  }
                }
              } catch (e) {
                // console.log(e);
              }
            }
          }
        }
      });
    });
  });

  provider._websocket.on("close", () => {
    console.log("WebSocket Closed...Reconnecting...");
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    startWSS(multiBuy, multiSell);
  });

  provider._websocket.on("error", () => {
    console.log("Error. Attemptiing to Reconnect...");
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    startWSS(multiBuy, multiSell);
  });

  provider._websocket.on("pong", () => {
    clearInterval(pingTimeout);
  });
};

module.exports = startWSS;
