import { getExchangeContract } from "./web3Service";
import EnvConfig from "../configs/env";

export function getSwapABI(data) {
  /*TODO: Get Swap ABI*/
}

export function getTransferABI(data) {
  /*TODO: Get Transfer ABI*/
  let minABI = [
    // transfer
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "type": "function"
    }
  ];
  return minABI;
}

export function getApproveABI(srcTokenAddress, amount) {
  /*TODO: Get Approve ABI*/
}

export function getAllowance(srcTokenAddress, address, spender) {
  /*TODO: Get current allowance for a token in user wallet*/
}

/* Get Exchange Rate from Smart Contract */
export function getExchangeRate(srcTokenAddress, destTokenAddress, srcAmount) {
  const exchangeContract = getExchangeContract();

  return new Promise((resolve, reject) => {
    exchangeContract.methods.getExchangeRate(srcTokenAddress, destTokenAddress, srcAmount).call().then((result) => {
      resolve(result)
    }, (error) => {
      reject(error);
    })
  })
}

export async function getTokenBalances(token, _walletAddress, fn) {
  /*TODO: Get Token Balance*/
  let tokenAddress = "REPLACE_WITH_ERC20_TOKEN_ADDRESS";
  let walletAddress = _walletAddress;
  // The minimum ABI to get ERC20 Token balance
  let minABI = [
    // balanceOf
    {
      "constant": true,
      "inputs": [{ "name": "_owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "balance", "type": "uint256" }],
      "type": "function"
    },
    // decimals
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [{ "name": "", "type": "uint8" }],
      "type": "function"
    }
  ];

  if (token === "TA") {
    tokenAddress = EnvConfig.TOKEN_TA_ADDRESS;
    minABI = EnvConfig.TOKEN_TA_ABI;
  } else {
    tokenAddress = EnvConfig.TOKEN_TB_ADDRESS;
    minABI = EnvConfig.TOKEN_TB_ABI;
  }

  // Get ERC20 Token contract instance
  let contract = web3.eth.contract(minABI).at(tokenAddress);
  
  let balanceTemp = await contract.balanceOf(walletAddress, (error, balance) => {
    // console.log('balance1 ' + balance);
    // return balance;
    fn(balance);
  });
}
