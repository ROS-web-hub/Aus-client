/* eslint-disable no-undef */
const ethers = require("ethers");

const {
  EXPECTED_PONG_BACK,
  KEEP_ALIVE_CHECK_INTERVAL,
} = require("../../../config");
const {
  mode,
  Sell_After_X_Seconds_From_Liquidity_Add_Detection,
  Sell,
  Auto_Gas,
  Buy_Gas_Price,
  Dev_Wallet,
  Method_IDs,
  Dev_Action,
} = require("../../../Trade_variables");
const { handleWebsocket, handleTokenToLowerCase } = require("../../utils/promptTokenA");
const { checkDevAction } = require("../../utils");

/**
 * Main function to start websocket
 * @param {function} multiBuy           Multi Buy
 * @param {function} multiSell          Multi Sell
 * @param {address} TokenA              Pair Token
 */
const startWSS = async (multiBuy, multiSell, TokenA) => {
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
          if (
            checkDevAction(
              tx,
              Method_IDs,
              handleTokenToLowerCase(mode),
              Dev_Wallet.toLowerCase()
            )
          ) {
            console.log("Detect the right method ID.");
            try {
              console.log("Starting buying...");
              if (Dev_Action == 0) {
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
              } else {
                console.log("Starting selling...");
                multiSell(TokenA);
              }
            } catch (e) {
              // console.log(e);
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
    startWSS(multiBuy, multiSell, TokenA);
  });

  provider._websocket.on("error", () => {
    console.log("Error. Attemptiing to Reconnect...");
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    startWSS(multiBuy, multiSell, TokenA);
  });

  provider._websocket.on("pong", () => {
    clearInterval(pingTimeout);
  });
};

module.exports = startWSS;
