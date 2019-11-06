import { debug } from "util";

$(function () {
  // Import Metamask
  $('#import-metamask').on('click', function () {
    /* TODO: Importing wallet by Metamask goes here. */
    // isInstalled()
    // isLocked()
    // checkBalance()
    // validate()
    // checkWeb3();
    // connectMetamask()
    let ethereum = window.ethereum;
    // let web3 = window.web3;
    // if (typeof ethereum !== 'undefined') {
    //   await ethereum.enable();
    //   web3 = new Web3(ethereum);
    // } else if (typeof web3 !== 'undefined') {
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER));
    // }
    // firstFunction(() => console.log('teo'))
    // demo(function(){
    //   console.log('teo');
    // })
    demo(() => connectMetamask());
  });
  // function firstFunction(callback){
  //   console.log('tuan')
  // }
  function demo(callback) {
    window.ethereum.enable();
    callback();
  }

  // Handle on Source Amount Changed
  $('#swap-source-amount').on('keydown', function () {
    /* TODO: Fetching latest rate with new amount */
    /* TODO: Updating dest amount */
    console.log('tuan123')
    let input = $('#swap-source-amount').value()

  });


  // Handle on click token in Token Dropdown List
  $('.dropdown__item').on('click', function () {
    $(this).parents('.dropdown').removeClass('dropdown--active');
    /* TODO: Select Token logic goes here */
  });

  // Handle on Swap Now button clicked
  $('#swap-button').on('click', function () {
    const modalId = $(this).data('modal-id');
    $(`#${modalId}`).addClass('modal--active');
  });

  // Tab Processing
  $('.tab__item').on('click', function () {
    const contentId = $(this).data('content-id');
    $('.tab__item').removeClass('tab__item--active');
    $(this).addClass('tab__item--active');

    if (contentId === 'swap') {
      $('#swap').addClass('active');
      $('#transfer').removeClass('active');
    } else {
      $('#transfer').addClass('active');
      $('#swap').removeClass('active');
    }
  });

  // Dropdown Processing
  $('.dropdown__trigger').on('click', function () {
    $(this).parent().toggleClass('dropdown--active');
  });

  // Close Modal
  $('.modal').on('click', function (e) {
    if (e.target !== this) return;
    $(this).removeClass('modal--active');
  });
});



function isInstalled() {
  if (typeof web3 !== 'undefined') {
    console.log('MetaMask is installed')
  }
  else {
    console.log('MetaMask is not installed')
  }
}
function isLocked() {
  web3.eth.getAccounts(function (err, accounts) {
    if (err != null) {
      console.log(err)
    }
    else if (accounts.length === 0) {
      console.log('MetaMask is locked')
    }
    else {
      console.log('MetaMask is unlocked')
    }
  });
}
function checkBalance() {
  tokenInst.balanceOf(
    web3.eth.accounts[0],
    function (error, result) {
      if (!error && result) {
        var balance = result.c[0];
        if (balance < balanceNeeded * (100000000)) {
          console.log('MetaMask shows insufficient balance')
          return false;
        }
        console.log('MetaMask shows sufficient balance')
        // Include here your transaction function here
      }
      else {
        console.error(error);
      }
      return false;
    });
}
var transactionApproval = true;
function validate() {
  if (typeof web3 !== 'undefined') {
    console.log('MetaMask is installed')
    web3.eth.getAccounts(function (err, accounts) {
      if (err != null) {
        console.log(err)
      }
      else if (accounts.length === 0) {
        console.log('MetaMask is locked')
      }
      else {
        console.log('MetaMask is unlocked')

        tokenInst.balanceOf(
          web3.eth.accounts[0],
          function (error, result) {

            if (!error && result) {
              var balance = result.c[0];
              if (balance < dappCost * (100000000)) {
                console.log('MetaMask has insufficient balance')
                return false;
              }
              console.log('MetaMask has balance')
              if (transactionApproval == true) {
                requestApproval();
                transactionApproval = false;
              }
            }
            else {
              console.error(error);
            }
            return false;
          });
      }
    });
  }
  else {
    console.log('MetaMask is not installed')
  }
}
// request approval from MetaMask user
function requestApproval() {
  tokenInst.approve(
    addrHOLD,
    truePlanCost,
    { gasPrice: web3.toWei('50', 'gwei') },
    function (error, result) {

      if (!error && result) {
        var data;
        console.log('approval sent to network.');
        var url = 'https://etherscan.io/tx/' + result;
        var link = '<a href=\"" + url + "\" target=\"_blank\">View Transaction</a>';
        console.log('waiting for approval ...');
        data = {
          txhash: result,
          account_type: selectedPlanId,
          txtype: 1, // Approval
        };
        apiService(data, '/transaction/create/', 'POST')
          .done(function (response) {
            location.href = response.tx_url;
          });
      }
      else {
        console.error(error);
        console.log('You rejected the transaction');
      }
    });
}
function connectMetamask() {
  console.log('connecting....')
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
    console.log('done')
    // Or connect to a node
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_PROVIDER));
    console.log('no')
  }

  // Check the connection
  if (!web3.isConnected()) {
    console.error("Not connected");

  }
  // console.log(web3.randomHex(32))
  var account = web3.currentProvider.selectedAddress;
  console.log(account)
  // console.log(web3)
  var currentAmount = web3.eth.getBalance(account, (err, wei) => {
    // balance = web3.utils.fromWei(wei, 'ether') 
    console.log(wei.toString())
  });
  // console.log(currentAmount)

  var accountInterval = setInterval(function () {
    if (web3.eth.accounts[0] !== account) {
      account = web3.currentProvider.selectedAddress
      console.log(account)
      var currentAmount = web3.eth.getBalance(account, (err, wei) => {
        // balance = web3.utils.fromWei(wei, 'ether') 
        console.log(wei.toString())
      });
      // console.log(currentAmount)
      // document.getElementById("address").innerHTML = account;
    }
  }, 100);


  // STEP2:

}
function checkWeb3() {
  try {
    console.log(require.resolve("web3"));
  } catch (e) {
    console.error("web3 is not found");
    process.exit(e.code);
  }
}
