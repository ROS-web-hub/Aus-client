/**
 * Check dev wallet action with method IDs
 * @param {string} tx                   pending transaction
 * @param {array} Method_IDs            array of method ID
 * @param {string} purchaseTokenAddress token address for purchase
 * @param {string} devWallet            dev wallet address
 * @returns
 */
const checkDevAction = (tx, Method_IDs, purchaseTokenAddress, devWallet) => {
  try {
    if (Method_IDs.length > 0) {
      const id = tx.data.slice(0, 10);
      const found = Method_IDs.find((method_id) => method_id == id);
      if (found == undefined) return false;
    }
    if (
      tx.to.toLowerCase() == purchaseTokenAddress &&
      tx.from.toLowerCase() == devWallet
    )
      return true;
    return false;
  } catch (e) {
    // console.log(e);
  }
};

module.exports = checkDevAction;
