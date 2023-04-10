const startWSS = require("./startWSS");

module.exports = (multiBuy, multiSell) => {
  console.log("Starting pinksale snipe!");
  startWSS(multiBuy, multiSell);
};
