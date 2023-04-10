const LocalStorage = require("node-localstorage").LocalStorage;
const valueStorage = new LocalStorage("./value");

const getStorageValue = (key) => {
  return JSON.parse(valueStorage.getItem(key));
};

const setStorageValue = (key, value) => {
  valueStorage.setItem(key, JSON.stringify(value));
};

module.exports = { getStorageValue, setStorageValue };
