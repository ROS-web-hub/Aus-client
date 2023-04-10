/* eslint-disable no-undef */
const clear = require("clear");

// const { purchaseToken } = process.env;

const { honeyPotScan, starting } = require("../../utils");

module.exports = () => {
  clear();
  starting();
  console.log("Checking if token is honeypot......");
  // honeyPotScan(
  //   `https://honeypot.api.rugdoc.io/api/honeypotStatus.js?address=${purchaseToken}&chain=bsc`
  // );
};
