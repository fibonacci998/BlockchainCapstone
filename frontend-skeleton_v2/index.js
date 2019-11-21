import { getExchangeRate, getTokenBalances } from "./services/networkService";
// import { getWeb3Instance } from "./services/web3Service";
import EnvConfig from "./configs/env";
import { isNumber } from "util";
var balanceEth;
var balanceTa;
var balanceTb;
var account;
var currentSrcToken;

function doInterval() {
  // alert('This pops up every 5 seconds and is annoying!');
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
    console.log("Address: " + compressAccount);

    $('#addressInfor').html("Address: " + compressAccount);
    $('#addressInforTransfer').html("Address: " + compressAccount);
  }
}
function getAmountEth() {
  if (web3.currentProvider.selectedAddress != null) {
    web3.eth.getBalance(web3.currentProvider.selectedAddress, (err, wei) => {
      // balance = web3.utils.fromWei(wei, 'ether') 
      if (wei !== 'undefined') {
        console.log($('#selected-src-symbol').text() + ": " + wei / Math.pow(10, 18));
        balanceEth = wei / Math.pow(10, 18);
        if (currentSrcToken.symbol === 'ETH') {
          $('#amountInfor').html($('#selected-src-symbol').text() + ": " + wei / Math.pow(10, 18));
          $('#amountInforTransfer').html($('#selected-src-symbol').text() + ": " + wei / Math.pow(10, 18));
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
    console.log("balance ta: " + balanceTa);

    if (balanceTa != null && balanceTa !== 'undefined') {
      console.log("balance ta: " + balanceTa / Math.pow(10, 18));
    }
    if (balanceTb != null && balanceTb !== 'undefined') {
      console.log("balance tb: " + balanceTb / Math.pow(10, 18));
    }
    if (currentSrcToken.symbol === 'AT') {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + balanceTa / Math.pow(10, 18));
      $('#amountInforTransfer').html($('#selected-src-symbol').text() + ": " + balanceTa / Math.pow(10, 18));
    }
    if (currentSrcToken.symbol === 'BT') {
      $('#amountInfor').html($('#selected-src-symbol').text() + ": " + balanceTb / Math.pow(10, 18));
      $('#amountInforTransfer').html($('#selected-src-symbol').text() + ": " + balanceTb / Math.pow(10, 18));
    }
  }
}

setInterval(doInterval, 5000); // Time in milliseconds

$('#transferButton').click(function () {
  $('#transferModal').modal();
});
$('#25-percent-transfer').click(function () {
  let balanceDisplay;
  if ($('#selected-transfer-token').html() === 'ETH') {
    balaceDisplay = balanceEth;
  } else if ($('#selected-transfer-token').html() === 'AT') {
    balaceDisplay = balanceTa;
  } else {
    balaceDisplay = balanceTb;
  }
  if (!isNaN(balaceDisplay)) {
    $('#transfer-source-amount').val(balaceDisplay * 0.25);
  }
});
$('#50-percent-transfer').click(function () {
  if (!isNaN(balaceDisplay)) {
    $('#transfer-source-amount').val(balaceDisplay * 0.5);
  }
});
$('#75-percent-transfer').click(function () {
  if (!isNaN(balaceDisplay)) {
    $('#transfer-source-amount').val(balaceDisplay * 0.75);
  }
});

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


    const srcToken = findTokenBySymbol($('#selected-src-symbol').text());
    const destToken = findTokenBySymbol($('#selected-dest-symbol').text());
    currentSrcToken = srcToken;
    $('#rate-src-symbol').html($('#selected-src-symbol').text());
    $('#rate-dest-symbol').html($('#selected-dest-symbol').text());
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

  });

  // Import Metamask
  $('#import-metamask').on('click', function () {
    /* TODO: Importing wallet by Metamask goes here. */

    // let ethereum = window.ethereum;
    // demo(() => connectMetamask());
    window.ethereum.enable().then(
      () => {
        console.log('ok')
        connectMetamask();
      },
      error => {
        console.log('not ok')
      }
    )


    // getWeb3Instance().then(instance,
    //   () => {
    //     web3New = instance;
    //     console.log('ok');
    //   },
    //   error=>{
    //     console.log('not ok')
    //   }
    // )
  });
  function demo(callback) {
    window.ethereum.enable();
    callback();
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

  }
  // Handle on Source Amount Changed
  $('#swap-source-amount').on('input change', function () {
    /* TODO: Fetching latest rate with new amount */
    /* TODO: Updating dest amount */
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
