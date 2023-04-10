module.exports = {
  //  Development mode(0: testnet-bsc, 1: mainnet-bsc, 2: test-ethereum, 3: main-ethereum)
  mode: 1,
  //  BSC-USD 0x55d398326f99059fF775485246999027B3197955
  //  PULSEPAD 0x8a74bc8c372bc7f0e9ca3f6ac0df51be15aec47a
  //  BUSD  0xe9e7cea3dedca5984780bafc599bd69add087d56
  //  Anji  0xfc619FfC  c0e0F30427BF938f9A1B2BfAE15bDf84
  //  Doge Verse  0x4F32173264A201A203526f660CC5AF0aa3836187
  //  WOD 0x298632d8ea20d321fab1c9b473df5dbda249b2b6
  // Contract of the Token
  Buy_Bsc_Token_Contract: "0xa9555dBDe3A7b355d34E6cE728A8aA021511eCbC",
  Buy_Eth_Token_Contract: "",

  // Buy Method   1. Exact Tokens, 0. Buy in WBNB
  Buy_Method: 1,

  // Amount of the tokens to buy
  Amount_Of_Tokens_To_Buy: 1,

  // Max WBNB to Buy
  Amount_Of_Max_WBNB_To_Buy: 0.00001,

  // Approve contract 0. ignore, 1. approve after buying in the same transaction
  Approve_Contract: false,

  // 0. false, 1. send to different wallet
  Send_To_Different_Wallet: 0,
  Receiver_Wallet: "0x19704D3aF48F0fCFe2C6B3cf63CA64f7c2188Fb8",

  // The websocket you would like to connect to.
  bsc_Websocket:"wss://ws-nd-886-010-557.p2pify.com/7efc1e751b6ab4e3db1edef608125510",
  eth_Websocket: "wss://eth.getblock.io/e7df963a-87d8-4373-ae66-afd8374212d6/mainnet/",

  // Gas Settings
  Auto_Gas: false, //  0. false, 1. Use liquidity add Gas
  Gas_Limit: 800000, //  Gas Limit
  Buy_Gas_Price: 10, //  Gas price for buying
  Sell_Gas_Price: 7, //  Gas price for selling
  Approve_Gas_Price: 5, //  Gas price for approving

  // Delay before buying
  Seconds_Delay_Before_1st_Buy: 0,
  Block_Delay_Before_1st_Buy: 0,

  // Multiple transactions to perform
  Rounds_To_Buy: 1,
  Delay_Between_Buy_Rounds: 3, //  seconds

  // Sell transactions
  Sell_Bsc_Token_Contract: "0x298632d8ea20d321fab1c9b473df5dbda249b2b6",
  Sell_Eth_Token_Contract: "",
  Sell: true, //  0, disabled, 1. enabled
  Sell_Quantity_Of_Tokens: 50, //  percentage
  Sell_On_Percentage_Gain: 500, //  Sell tokens when 500% gain is achieved.
  Sell_After_X_Seconds_From_Liquidity_Add_Detection: 0, //  "i.e. liquidity_add was detected at 13:55:00, Bot will wait 210 seconds from that time before sending sell transaction at 13:58:30"

  Stop_Listening_On_Liq_Change_Detected: false, //  when liquidity is added... complete the current rounds.... and stop.... dont keep processing new liq detected triggers

  // Slippage
  Buy_Slippage: 10,
  Sell_Slippage: 20,

  Method_IDs: [],
  Dev_Wallet: "0x19704D3aF48F0fCFe2C6B3cf63CA64f7c2188Fb8",
  Dev_Action: 0, //  0: bot will buy, 1: bot will sell

  //  For Testnet
  test_Bsc_Websocket: "wss://bsc.getblock.io/e7df963a-87d8-4373-ae66-afd8374212d6/testnet/",
  test_Eth_Websocket: "wss://eth.getblock.io/e7df963a-87d8-4373-ae66-afd8374212d6/goerli/",
  // test_Bsc_Websocket: "ws://localhost:27147/websocket",
  //  BUSD: 0x78867bbeef44f2326bf8ddd1941a4439382ef2a7
  //  Wicked :  0x2d06c6567a671e564f26a245b09d733466cb15d2
  //  tk1:  0xfe38af83f6ac838bfadc6f584fbde937484dba7c
  //  Shaodo5:  0xa7C469eaAF756f1A251B99E80F6767BaF4bA59A0
  //  Tether: 0x7ef95a0fee0dd31b22626fa2e10ee6a223f8a684
  //  GD: 0xac0136a334c99853209214eafc3ec1c2e2584ded
  //  0x6163f4e9252dd44462C15c3aC7BeB8DE37380A52
  //  0x31BD5EDA15725BfE7AF02eC0C3ec20f9170f2Efa
  Test_Buy_Bsc_Token_Contract: "0x6163f4e9252dd44462C15c3aC7BeB8DE37380A52",
  Test_Buy_Eth_Token_Contract: "",

  Test_Sell_Bsc_Token_Contract: "0x6163f4e9252dd44462C15c3aC7BeB8DE37380A52",
  Test_Sell_Eth_Token_Contract: "",

};
