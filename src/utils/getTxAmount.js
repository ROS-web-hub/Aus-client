const ethers = require("ethers");

/**
 * Get transaction amount from a transaction log
 * @param {object} receipt Receiption Object
 */
const getTxAmount = async (receipt, decimals) => {
  const transferAbi = [
    "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
  ];
  const iface = new ethers.utils.Interface(transferAbi);

  let amountOut;
  //  wbnb/token
  if (receipt.logs.length === 4) {
    let { amount0Out, amount1Out } = iface.parseLog(receipt.logs[3]).args;
    amountOut = amount0Out.isZero() ? amount1Out : amount0Out;
  }
  //  busd/token or usdt/token
  else {
    let { amount0Out, amount1Out } = iface.parseLog(receipt.logs[6]).args;
    amountOut = amount0Out.isZero() ? amount1Out : amount0Out;
  }

  amountOut = ethers.utils.formatUnits(amountOut, decimals);
  return amountOut;
};

module.exports = getTxAmount;
