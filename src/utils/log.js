/* eslint-disable no-undef */
const fs = require("fs");
const LocalStorage = require("node-localstorage").LocalStorage;
const valueStorage = new LocalStorage("./value");
const logStorage = new LocalStorage("./log");

const LOG_DIR = process.cwd() + "/log/";

const getNowDate = () => {
  let d = new Date(Date.now()),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return year + month + day;
};

const filterNumber = (number) => {
  let str = "";
  let len = number.toString().length;
  for (let i = 0; i < 4 - len; i++) str += "0";
  str += number;
  return str;
};

const createLog = () => {
  try {
    console.log('process: ', process);
    console.log(LOG_DIR);
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR);
    }
    const files = fs.readdirSync(LOG_DIR);
    const lastFileName = files.length ? files[files.length - 1] : "";
    const now = getNowDate();
    
    if (lastFileName.includes(now)) {
      const number = Number(lastFileName.split(".")[1]) + 1;
      valueStorage.setItem("log_id", `${now}.${filterNumber(number)}.txt`);
    } else {
      valueStorage.setItem("log_id", `${now}.0001.txt`);
    }
  } catch (e) {
    console.log(e);
    process.exit();
  }
};

const writeLog = (content) => {
  const logFileName = valueStorage.getItem("log_id");
  let data = logStorage.getItem(logFileName);
  data = data != null ? data : "";
  logStorage.setItem(logFileName, data + "\n" + content);
};

module.exports = { createLog, writeLog };
