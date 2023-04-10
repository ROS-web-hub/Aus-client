const startWSS = require("./startWSS");

module.exports = (multiBuy, multiSell) => {
  console.log("Starting a token launch snipe!");
  startWSS(multiBuy, multiSell);
};
