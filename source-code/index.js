import { getExchangeRate, getTokenBalances, getTransferABI } from "./services/networkService";
// import { getWeb3Instance } from "./services/web3Service";
import EnvConfig from "./configs/env";
import { isNumber } from "util";
import { getWeb3Instance } from "./services/web3Service";

var balanceEth;
var balanceTa;
var balanceTb;
var account;
var currentSrcToken;
var amountSrcToken;

// interval get information in wallet
function doInterval() {
  getAddress();
  getAmountEth();
  getAmountToken();
}
function getAddress() {
  if (web3.currentProvider.selectedAddress != null) {
    // console.log(web3.currentProvider.selectedAddress);
    $('#accountInfor').removeClass('d-none');
    $('#accountInforTransfer').removeClass('d-none');
    let accountInfor = web3.currentProvider.selectedAddress;
    account = accountInfor;

    let compressAccount = accountInfor.substring(0, 10) + "..." + accountInfor.substring(accountInfor.length - 5, accountInfor.length);
    // console.log("Address: " + compressAccount);

    $('#addressInfor').html("Address: " + compressAccount);
    $('#addressInforTransfer').html("Address: " + compressAccount);
  }
}
function getAmountEth() {
  if (web3.currentProvider.selectedAddress != null && currentSrcToken !== undefined) {
    web3.eth.getBalance(web3.currentProvider.selectedAddress, (err, wei) => {
      // balance = web3.utils.fromWei(wei, 'ether') 
      if (wei !== 'undefined') {
        // console.log($('#selected-src-symbol').text() + ": " + wei / Math.pow(10, 18));
        balanceEth = wei / Math.pow(10, 18);
        if (currentSrcToken.symbol === 'ETH') {
          $('#amountInfor').html($('#selected-src-symbol').text() + ": " + wei / Math.pow(10, 18));
          $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + wei / Math.pow(10, 18));
          amountSrcToken = wei / Math.pow(10, 18);
        }
      }
      // return wei/Math.pow(10,18);
    });
  }
}
function getAmountToken() {

  if (web3.currentProvider.selectedAddress != null) {
    var setValueTa = function (value) {
      balanceTa = value;
    }
    var setValueTb = function (value) {
      balanceTb = value;
    }
    getTokenBalances('TA', account, setValueTa);
    getTokenBalances('TB', account, setValueTb);
    if (currentSrcToken !== undefined && currentSrcToken.symbol === 'AT') {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + balanceTa / Math.pow(10, 18));
      $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + balanceTa / Math.pow(10, 18));
      amountSrcToken = balanceTa / Math.pow(10, 18);
    }
    if (currentSrcToken !== undefined && currentSrcToken.symbol === 'BT') {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + balanceTb / Math.pow(10, 18));
      $('#amountInforTransfer').html($('#selected-transfer-token').text() + ": " + balanceTb / Math.pow(10, 18));
      amountSrcToken = balanceTb / Math.pow(10, 18);
    }
  }
}

setInterval(doInterval, 5000); // Time in milliseconds


// validate input in transfer tab
async function alertErrorTransferTab(errorMessage) {
  // $('.alert').show('fade');
  $('#messageErrorTransfer').html(errorMessage);
  console.log('error')
  $('#alert-transfer-tab').removeClass('fade');
  await timeout(4000);
  $('#alert-transfer-tab').addClass('fade');
}
function isValidNumberInputSourceTransfer() {
  return (!isNaN($('#transfer-source-amount').val()));
}
function isValidAddressInputAddressTransfer() {
  return getWeb3Instance().utils.isAddress($('#transfer-address').val());
}
function isInputInRangeTransferTab() {
  let number = $('#transfer-source-amount').val();
  let max = amountSrcToken;
  if (number <= 0 || number > max) {
    return false;
  }
  return true;
}
function validateTransfer() {
  if (!isValidNumberInputSourceTransfer()) {
    alertErrorTransferTab('Invalid number');
    return false;
  }
  if (!isValidAddressInputAddressTransfer()) {
    alertErrorTransferTab('Invalid address');
    return false;
  }
  if (!isInputInRangeTransferTab()) {
    alertErrorTransferTab('Please enter number greater than 0, less than current balance');
    return false;
  }
  return true
}

$('#transferButton').click(function () {
  if (!validateTransfer()) {
    return;
  }
  let amountToken = $('#transfer-source-amount').val() + " " + $('#selected-transfer-token').html();
  let toAddress = $('#transfer-address').val();
  let compressAccount = toAddress.substring(0, 6) + "..." + toAddress.substring(toAddress.length - 5, toAddress.length);
  $('#amount-transfer-modal').html(amountToken);
  $('#to-address-modal').html(compressAccount);

  let transactionObject = {
    from: account,
    to: $('#transfer-address').val(),
    value: web3.toWei(Number($('#transfer-source-amount').val()), "ether")
  };

  function calculateGasFee(transactionObject) {
    let gasPrice;
    let gasEstimate;
    let gasFee;
    console.log(transactionObject);
    function setGasPrice(err, value) {
      gasPrice = value;
      changGasFee();
      console.log("price main: " + gasPrice);
    }
    function setGasEstimate(err, value) {
      gasEstimate = value;
      changGasFee();
      console.log("estimate main: " + gasEstimate);
    }
    function changGasFee() {
      gasFee = gasPrice * gasEstimate / Math.pow(10, 18);
      console.log("GAS FEE: " + gasFee);
      if (!isNaN(gasFee)) {
        $('#gas-fee-transfer').html(gasFee);
      }
    }
    web3.eth.getGasPrice((err, result) => setGasPrice(err, result));
    web3.eth.estimateGas(transactionObject, (err, result) => setGasEstimate(err, result));
  }
  calculateGasFee(transactionObject);

  $('#confirm-transfer-modal').modal();

});
$('#confirm-transfer-button').click(function () {
  $('#confirm-transfer-modal').modal('hide');

  // $('#contain-status-modal').addClass('text-secondary');
  // $('#name-status-modal').html('Broadcasting');
  $('#status-transfer-modal').modal('show');
  setModal('text-secondary', 'Broadcasting');

  function setModal(textColor, statusTx, transactionAddress) {
    function removeClass(index, className) {
      return (className.match(/\btext-\S+/g) || []).join(' ');
    }
    $('#contain-status-modal').removeClass(removeClass);
    if (transactionAddress != null) {
      let addressTxCompress = transactionAddress.substring(0, 10) + "..." + transactionAddress.substring(transactionAddress.length - 5, transactionAddress.length);
      $('#transaction-hash-modal').html(addressTxCompress);
      $('#link-to-ropsten').attr('href', 'https://ropsten.etherscan.io/tx/' + transactionAddress);
      $('#link-to-ropsten').removeClass('d-none');
    } else {
      $('#transaction-hash-modal').html("Processing");
      if (!$('#link-to-ropsten').hasClass('d-none')) {
        $('#link-to-ropsten').addClass('d-none');
      }
    }

    $('#contain-status-modal').addClass(textColor);
    $('#name-status-modal').html(statusTx);
    if (statusTx === 'Success') {
      $('#icon-success-modal').removeClass('d-none');
      $('#spinner-status-modal').addClass('d-none');
    } else {
      if (!$('#icon-success-modal').hasClass('d-none')) {
        $('#icon-success-modal').addClass('d-none');
      }
      if ($('#spinner-status-modal').hasClass('d-none')) {
        $('#spinner-status-modal').removeClass('d-none');
      }

    }
  }

  if (account != null && account !== 'undefined') {
    if (currentSrcToken.symbol === 'ETH') {

      let transactionObject = {
        from: account,
        to: $('#transfer-address').val(),
        value: web3.toWei(Number($('#transfer-source-amount').val()), "ether")
      };




      web3.eth.sendTransaction(transactionObject, function (err, transactionHash) {
        if (!err) {
          console.log(transactionHash + " success");
          setModal('text-primary', "Broadcasted", transactionHash);

          let check = function (err, result) {
            console.log("result transaction: " + result);
            console.log("error transaction: " + err);
            if (result != null) {
              setModal('text-success', "Success", transactionHash);
              clearInterval(intevalReceipt);
            }
          }

          let intevalReceipt = setInterval(function () {
            // console.log('here');
            web3.eth.getTransactionReceipt(transactionHash, (err, result) => check(err, result))
          }, 2000);


        } else {
          console.log(err);
        }
      });

    } else {
      let tokenAddress = currentSrcToken.address;
      let toAddress = $('#transfer-address').val();
      let amount = Number($('#transfer-source-amount').val());
      let minABI = currentSrcToken.ABI;

      // Get ERC20 Token contract instance
      let contract = web3.eth.contract(minABI).at(tokenAddress);
      // calculate ERC20 token amount
      let value = amount * Math.pow(10, 18);
      // call transfer function
      contract.transfer(toAddress, value, (err, txHash) => checkStatus(err, txHash));
    }

  }
  function checkStatus(err, txHash) {
    if (txHash != null && txHash != undefined) {
      setModal('text-primary', "Broadcasted", txHash);
    }
    var check = function (err, result) {
      console.log("result transaction: " + result);
      console.log("error transaction: " + err);
      if (result != null) {
        setModal('text-success', "Success", txHash);
        clearInterval(intevalReceipt);
      }
    }

    var intevalReceipt = setInterval(function () {
      // console.log('here');
      web3.eth.getTransactionReceipt(txHash, (err, result) => check(err, result))
    }, 2000);
  }
})


function buildStatusModal(err, txHash) {
  async function getStatusByTxHash(txHash) {
    const response = await fetch('https://api-ropsten.etherscan.io/api?module=transaction&action=getstatus&txhash=' + txHash + '&apikey=1493a1e8a6014c18b75f29ba0a749270');

  }

  async function getTransactionStatus(txHash) {
    console.log("transaction hash: " + txHash);
    // const response = await getWeb3Instance().eth.getTransactionReceipt(txHash);
    // const data = await JSON.parse(response);
    getWeb3Instance().eth.getTransactionReceipt(txHash).then(result => {
      console.log("detail: " + result);
    })
  }
  getTransactionStatus();
  // setInterval(getTransactionStatus, 10000);

  $('#statusModal').modal();
}


$('#swap-button').click(function () {
  if (!isValidNumberInputSourceSwap()) {
    alertError("Invalid number");
    return;
  }
  if (!isInputInRange()) {
    alertError("Amount must greater than 0, less than current amount");
    return;
  }
  let rate = "1 " + $('#rate-src-symbol').html() + " = " + $('#exchange-rate').html() + " " + $('#rate-dest-symbol').html();

  let sourceSwap = $('#swap-source-amount').val() + ' ' + $('#selected-src-symbol').html();
  let destSwap = $('#amount-dest-swap').html() + ' ' + $('#selected-dest-symbol').html();
  $('#source-swap').html(sourceSwap)
  $('#dest-swap').html(destSwap);
  $('#rate-modal').html(rate);
  $('#confirm-swap-modal').modal();
})

function timeout(ms) {
  return new Promise(res => setTimeout(res, ms));
}
//validate input in swap tab
async function alertError(errorMessage) {
  // $('.alert').show('fade');
  $('#messageError').html(errorMessage);
  console.log('error')
  $('#alert-swap-tab').removeClass('fade');
  await timeout(4000);
  $('#alert-swap-tab').addClass('fade');
}
function isValidNumberInputSourceSwap() {
  return (!isNaN($('#swap-source-amount').val()));
}
function isInputInRange() {
  let number = $('#swap-source-amount').val();
  let max = amountSrcToken;
  if (number <= 0 || number > max) {
    return false;
  }
  return true;
}



$(function () {
  initiateProject();

  function initiateProject() {
    const defaultSrcSymbol = EnvConfig.TOKENS[0].symbol;
    const defaultDestSymbol = EnvConfig.TOKENS[1].symbol;
    currentSrcToken = EnvConfig.TOKENS[0];
    initiateDropdown();
    initiateSelectedToken(defaultSrcSymbol, defaultDestSymbol);
    initiateDefaultRate(defaultSrcSymbol, defaultDestSymbol);
  }

  function initiateDropdown() {
    let dropdownTokens = '';

    EnvConfig.TOKENS.forEach((token) => {
      dropdownTokens += `<div class="dropdown__item">${token.symbol}</div>`;
    });

    $('.dropdown__content').html(dropdownTokens);
  }

  function initiateSelectedToken(srcSymbol, destSymbol) {
    $('#selected-src-symbol').html(srcSymbol);
    $('#selected-dest-symbol').html(destSymbol);
    $('#rate-src-symbol').html(srcSymbol);
    $('#rate-dest-symbol').html(destSymbol);
    $('#selected-transfer-token').html(srcSymbol);
  }

  function initiateDefaultRate(srcSymbol, destSymbol) {
    const srcToken = findTokenBySymbol(srcSymbol);
    const destToken = findTokenBySymbol(destSymbol);
    // const defaultSrcAmount = (Math.pow(10, 18)).toString();
    const defaultSrcAmount = "1";

    getExchangeRate(srcToken.address, destToken.address, defaultSrcAmount).then((result) => {
      const rate = result / Math.pow(10, 18);
      $('#exchange-rate').html(rate);
    }).catch((error) => {
      console.log(error);
      $('#exchange-rate').html(0);
    });
  }

  function findTokenBySymbol(symbol) {
    return EnvConfig.TOKENS.find(token => token.symbol === symbol);
  }

  // On changing token from dropdown.
  $(document).on('click', '.dropdown__item', function () {
    const selectedSymbol = $(this).html();
    $(this).parent().siblings('.dropdown__trigger').find('.selected-target').html(selectedSymbol);
    console.log('hello')
    /* TODO: Implement changing rate for Source and Dest Token here. */
    //reset input amount
    $('#swap-source-amount').val('');
    $('#transfer-source-amount').val('');
    $('#amount-dest-swap').text('0');
    $('#amount-dest-transfer').text('0');
    updateRateSwap();
  });
  function updateRateSwap() {

    const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
    const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
    const srcTransferToken = findTokenBySymbol($('#selected-transfer-token').text());

    if ($('#tab_swap').hasClass('tab__item--active')) {
      currentSrcToken = srcToken;
    } else {
      currentSrcToken = srcTransferToken;
    }



    $('#rate-src-symbol').html($('#selected-src-symbol').text());
    $('#rate-dest-symbol').html($('#selected-dest-symbol').text());
    $('rate')
    if (srcToken.address === destToken.address) {
      $('#exchange-rate').html(1);
    } else {
      getExchangeRate(srcToken.address, destToken.address, 1).then((result) => {
        const rate = result / Math.pow(10, 18);
        $('#exchange-rate').html(rate);
      }).catch((error) => {
        console.log(error);
        $('#exchange-rate').html(0);
      });
    }

  }

  // Import Metamask
  $('#import-metamask').on('click', function () {
    /* TODO: Importing wallet by Metamask goes here. */

    window.ethereum.enable().then(
      () => {
        console.log('ok')
        connectMetamask();
      },
      error => {
        console.log('not ok')
      }
    )
  });

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

  }
  // Handle on Source Amount Changed
  $('#swap-source-amount').on('input change', function () {
    /* TODO: Fetching latest rate with new amount */
    /* TODO: Updating dest amount */
    if (isNaN($('#swap-source-amount').val())) {
      return;
    }
    $('#amount-dest-swap').html(Number($('#exchange-rate').text()) * Number($('#swap-source-amount').val()));
  });

  // Handle on click token in Token Dropdown List
  $('.dropdown__item').on('click', function () {
    $(this).parents('.dropdown_left').removeClass('dropdown--active');
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

  $('#change-src-dest').on('click', function () {
    let srcToken = $('#selected-src-symbol').text();
    let destToken = $('#selected-dest-symbol').text();

    $('#selected-src-symbol').html(destToken);
    $('#selected-dest-symbol').html(srcToken);

    $('#swap-source-amount').val('0');
    $('#amount-dest-swap').text('0');

    updateRateSwap();
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

$('#25-percent-transfer').click(function () {
  let balanceDisplay;
  if ($('#selected-transfer-token').html() === 'ETH') {
    balanceDisplay = balanceEth;
  } else if ($('#selected-transfer-token').html() === 'AT') {
    balanceDisplay = balanceTa;
  } else {
    balanceDisplay = balanceTb;
  }
  if (!isNaN(balanceDisplay)) {
    $('#transfer-source-amount').val(balanceDisplay / Math.pow(10, 18) * 0.25);
  }
});
$('#50-percent-transfer').click(function () {
  let balanceDisplay;
  if ($('#selected-transfer-token').html() === 'ETH') {
    balanceDisplay = balanceEth;
  } else if ($('#selected-transfer-token').html() === 'AT') {
    balanceDisplay = balanceTa;
  } else {
    balanceDisplay = balanceTb;
  }
  if (!isNaN(balanceDisplay)) {
    $('#transfer-source-amount').val(balanceDisplay / Math.pow(10, 18) * 0.5);
  }
});
$('#100-percent-transfer').click(function () {
  let balanceDisplay;
  if ($('#selected-transfer-token').html() === 'ETH') {
    balanceDisplay = balanceEth;
  } else if ($('#selected-transfer-token').html() === 'AT') {
    balanceDisplay = balanceTa;
  } else {
    balanceDisplay = balanceTb;
  }
  if (!isNaN(balanceDisplay)) {
    $('#transfer-source-amount').val(balanceDisplay / Math.pow(10, 18));
  }
});