/* eslint-disable no-undef */
const ethers = require("ethers");

const {
  EXPECTED_PONG_BACK,
  KEEP_ALIVE_CHECK_INTERVAL,
} = require("../../../config");
const { pinkfinalize } = require("../../constant");
const {
  mode,
  websocket,
  test_Bsc_Websocket,
  Sell_After_X_Seconds_From_Liquidity_Add_Detection,
  Stop_Listening_On_Liq_Change_Detected,
  Sell,
  Auto_Gas,
  Buy_Gas_Price,
  Dev_Wallet,
} = require("../../../Trade_variables");

const { handleWebsocket } = require("../../utils/promptTokenA");

/**
 * Main function to start websocket
 * @param {function} multiBuy           Multi Buy
 * @param {function} multiSell          Multi Sell
 */
const startWSS = async (multiBuy, multiSell) => {
  let isStopEverything = false;

  const provider = new ethers.providers.WebSocketProvider(
    handleWebsocket(mode)
  );
  let pingTimeout = null;
  let keepAliveInterval = null;
  provider._websocket.on("open", async () => {
    keepAliveInterval = setInterval(() => {
      provider._websocket.ping();
      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, EXPECTED_PONG_BACK * 1000);
    }, KEEP_ALIVE_CHECK_INTERVAL * 1000);
    console.log("Scanning mempool...");
    provider.on("pending", async (txHash) => {
      provider.getTransaction(txHash).then(async (tx) => {
        if (tx && tx.from) {
          if (tx.from.toLowerCase() === Dev_Wallet.toLowerCase()) {
            if (pinkfinalize.test(tx.data)) {
              console.log("Finalize was found");
              try {
                if (!isStopEverything) {
                  if (Stop_Listening_On_Liq_Change_Detected) {
                    isStopEverything = true;
                  }
                  console.log("Starting buying...");
                  multiBuy(
                    Auto_Gas
                      ? ethers.utils.formatUnits(tx.gasPrice, "gwei")
                      : Buy_Gas_Price
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
                      multiSell();
                    }, Sell_After_X_Seconds_From_Liquidity_Add_Detection * 1000);
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
