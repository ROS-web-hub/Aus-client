const startWSS = require("./startWSS");
const { promptTokenA } = require("../../utils");

module.exports = (multiBuy, multiSell) => {
  const tokenA = promptTokenA();
  console.log("Starting dev action with Method IDs");
  startWSS(multiBuy, multiSell, tokenA);
};
