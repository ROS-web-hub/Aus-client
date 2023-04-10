const axios = require("axios");

module.exports = async (url) => {
  let trade;
  await axios
    .get(url)
    .then((result) => {
      if (result.data.status == "OK") {
        console.log("\x1b[33m%s\x1b[0m", `No honeypot detected`);
        trade = "true";
      } else if (result.data.status == "SWAP_FAILED") {
        trade = "false";
        console.log(
          "\x1b[33m%s\x1b[0m",
          "Failed to sell the token. This is very likely a honeypot."
        );
        return trade;
      } else if (result.data.status == "MEDIUM_FEE") {
        trade = "true";
        console.log(
          "\x1b[33m%s\x1b[0m",
          "A medium trading fee was detected 15-20%. Token is able to swap"
        );
      } else if (result.data.status == "HIGH_FEE") {
        trade = "false";
        console.log(
          "\x1b[33m%s\x1b[0m",
          "A high trading fee was detected 20-50%. Not traiding"
        );
      } else if (result.data.status == "SEVERE_FEE") {
        trade = "false";
        console.log(
          "\x1b[33m%s\x1b[0m",
          "A high trading fee over 50% was detected."
        );
      } else if (result.data.status == "NO_PAIRS") {
        console.log(
          "\x1b[33m%s\x1b[0m",
          "This token does not have a pair yet."
        );
        trade = "false";
      } else {
        console.log(result.data.status);
        console.log(
          "\x1b[33m%s\x1b[0m",
          "Unable to read status code. Please contact Snipesz support team to fix this."
        );
        trade = "false";
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
