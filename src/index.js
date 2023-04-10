/* eslint-disable no-undef */
const clear = require("clear");
const prompt = require("prompt-sync")({ sigint: true });

const {
  MultiBuyOrder,
  MultiSellOrder,
  MultiApproveOrder,
  Launch,
  Pinksale,
  DevAction,
  Utilities,
} = require("./function");

const { starting } = require("./common");
const { storage, log, promptTokenA } = require("./utils/");
const { WALLETS } = require("../config");
const {
  Buy_Gas_Price,
  Sell,
  Sell_On_Percentage_Gain,
  Sell_After_X_Seconds_From_Liquidity_Add_Detection,
  Stop_Listening_On_Liq_Change_Detected,
} = require("../Trade_variables");

const optionMenu = async () => {
  console.log(
    "Please input what you want.\n 1) Buy\n 2) Sell\n 3) Approve \n 4) Buy on Liquidity Add \n 5) Pinksale \n 6) Buy on Dev Action (MethodID) \n 7) Utilities"
  );
  let menu = prompt("Please select an option: ");
  switch (menu) {
    case "1":
      log.writeLog("\nFunction: Buy\n");
      TokenA = promptTokenA();
      MultiBuyOrder(
        () => {
          optionMenu();
        },
        Buy_Gas_Price,
        TokenA
      );
      break;
    case "2":
      log.writeLog("\nFunction: Sell\n");
      TokenA = promptTokenA();
      MultiSellOrder(() => {
        optionMenu();
      }, TokenA);
      break;
    case "3":
      log.writeLog("\nFunction: Approve\n");
      MultiApproveOrder(() => {
        optionMenu();
      });
      break;
    case "4":
      log.writeLog("\nFunction: Buy On Liquidity Add\n");
      Launch(
        (gas_price, TokenA) => {
          MultiBuyOrder(
            !Sell
              ? () => {
                  optionMenu();
                }
              : null,
            gas_price,
            TokenA
          );
        },
        (TokenA) => {
          MultiSellOrder(
            Stop_Listening_On_Liq_Change_Detected &&
              (!Sell ||
                (Sell &&
                  !Sell_On_Percentage_Gain &&
                  Sell_After_X_Seconds_From_Liquidity_Add_Detection))
              ? () => {
                  optionMenu();
                }
              : null,
            TokenA
          );
        }
      );
      break;
    case "5":
      log.writeLog("\nFunction: Pinksale\n");
      Pinksale(
        (gas_price) => {
          MultiBuyOrder(
            !Sell
              ? () => {
                  optionMenu();
                }
              : null,
            gas_price
          );
        },
        () => {
          MultiSellOrder(
            !Stop_Listening_On_Liq_Change_Detected &&
              (!Sell ||
                (Sell &&
                  !Sell_On_Percentage_Gain &&
                  Sell_After_X_Seconds_From_Liquidity_Add_Detection))
              ? () => {
                  optionMenu();
                }
              : null
          );
        }
      );
      break;

    case "6":
      log.writeLog("\nFunction: Buy on Dev Action (MethodID)\n");
      DevAction(
        (gas_price, TokenA) => {
          MultiBuyOrder(
            !Sell
              ? () => {
                  optionMenu();
                }
              : null,
            gas_price,
            TokenA
          );
        },
        (TokenA) => {
          MultiSellOrder(
            !Sell ||
              (Sell &&
                !Sell_On_Percentage_Gain &&
                Sell_After_X_Seconds_From_Liquidity_Add_Detection)
              ? () => {
                  optionMenu();
                }
              : null,
            TokenA
          );
        }
      );
      break;
    case "7":
      log.writeLog("\nFunction: Utilities\n");
      Utilities(() => {
        optionMenu();
      });
      break;
    default:
      optionMenu();
      break;
  }
};

const main = () => {
  clear();
  starting();
  console.log("Please select wallets.");
  console.log("[1] All Wallets");
  for (let i = 1; i <= WALLETS.length; i++) {
    console.log(`[${i + 1}] ${WALLETS[i - 1].name} ${WALLETS[i - 1].address}`);
  }
  let menu = prompt("Type number lists: ");
  if (menu.length == 0) {
    console.log("no value");
    process.exit();
  }
  const wallets = menu.trim().split(",");
  let error = { status: false, msg: "" };
  for (let wallet of wallets) {
    if (isNaN(wallet)) {
      error = { status: true, msg: "invalid number" };
      break;
    } else if (wallet > WALLETS.length + 1) {
      error = { status: true, msg: "overflow number" };
      break;
    } else if (Number(wallet) != Math.floor(Number(wallet))) {
      error = { status: true, msg: "must be only integer" };
      break;
    }
  }
  if (error.status) {
    console.log(`Error: ${error.msg}`);
    process.exit();
  }
  if (wallets.includes("1")) {
    storage.setStorageValue("wallets", WALLETS);
    let logStr = "";
    for (let wallet of WALLETS) logStr += `\n${wallet.name}\n${wallet.address}`;
    log.writeLog(`Wallets:\n${logStr}`);
  } else {
    for (let i in wallets) wallets[i] = WALLETS[wallets[i] - 2];
    storage.setStorageValue("wallets", wallets);
    let logStr = "";
    for (let wallet of wallets) logStr += `\n${wallet.name}\n${wallet.address}`;
    log.writeLog(`Wallets:\n${logStr}`);
  }
  log.writeLog("\nParameter\n");
  const configs = require("../Trade_variables");
  const config_keys = Object.keys(configs);
  for (let key of config_keys) {
    log.writeLog(`${key}: ${configs[key]}`);
  }
  optionMenu();
};

module.exports = main;
