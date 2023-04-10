/**
 * Clear the temp data
 * log folder
 * value folder
 */

const fs = require("fs");

try {
  fs.rmdirSync("./log", { recursive: true });

  fs.rmdirSync("./value", { recursive: true });
} catch (e) {
  console.log(e);
}
