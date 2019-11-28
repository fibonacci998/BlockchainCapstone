import { getExchangeContract, getTokenContract } from "./web3Service";
import EnvConfig from "../configs/env";

export function doSwap(srcTokenAddress, destTokenAddress, account, amount, amountEth, web3, fn) {
  const exchangeContract = web3.eth.contract(EnvConfig.EXCHANGE_CONTRACT_ABI).at(EnvConfig.EXCHANGE_CONTRACT_ADDRESS);
  exchangeContract.exchangeTokens(srcTokenAddress, destTokenAddress, amount.toString(), { from: account, value: amountEth.toString() },
    function (result, error) {
      fn(error, result);
    })
}
export function calculateEstimateGasExchangeToken(srcTokenAddress, destTokenAddress, account, amount, web3, fn) {
  const exchangeContract = web3.eth.contract(EnvConfig.EXCHANGE_CONTRACT_ABI).at(EnvConfig.EXCHANGE_CONTRACT_ADDRESS);
  exchangeContract.exchangeTokens.estimateGas(srcTokenAddress, destTokenAddress, amount.toString(), { from: account, value: amount.toString() },
    function (result, error) {
      fn(error, result);
    }
  )
}

export function calculateEstimateGasApprove(srcTokenAddress, amount, spender, web3, fn) {
  const tokenContract = web3.eth.contract(EnvConfig.TOKEN_ABI).at(srcTokenAddress);
  tokenContract.approve.estimateGas(spender, amount,
    function (result, error) {
      fn(error, result);
    }
  )
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

export function doApprove(tokenAddress, amount, spender, web3, fn) {
  /*TODO: Get Approve ABI*/
  // const tokenContract = getTokenContract(tokenAddress);
  const tokenContract = web3.eth.contract(EnvConfig.TOKEN_ABI).at(tokenAddress);
  return new Promise((resolve, reject) => {
    tokenContract.approve(spender, amount.toString(),
      function (result, error) {
        fn(error, result);
      }
    )
  })
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

export async function getTokenBalances(tokenAddress, _walletAddress, fn) {
  /*TODO: Get Token Balance*/
  let walletAddress = _walletAddress;
  // The minimum ABI to get ERC20 Token balance
  let minABI = EnvConfig.TOKEN_ABI;
  // Get ERC20 Token contract instance
  let contract = web3.eth.contract(minABI).at(tokenAddress);

  let balanceTemp = await contract.balanceOf(walletAddress, (error, balance) => {
    // console.log('balance1 ' + balance);
    // return balance;
    fn(balance);
  });
}
