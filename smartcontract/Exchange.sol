pragma solidity ^0.4.17;
// import './Reserve.sol';
interface ERC20 {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}
interface Reserve{
    function withdraw(address tokenAddress, uint amount) public;
    function getExchangeRate(bool isBuy) public view returns(uint);
    function setExchangeRates(uint buyRate, uint sellRate) public;
    function setTradeFlag(bool value) public;
    function exchange(bool _isBuy, uint amount) payable public returns(uint);
    function getBalance()public view returns(uint);
    function getBalanceToken() public view returns(uint);
}
contract Exchange{
    //address of owner
    address owner;
    //address of native token 
    address public constant addressEth = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    mapping(address => Reserve) listReserves;
    
    function Exchange() public{
        owner = msg.sender;
    }
    function addReserve(address reserveAddress, address tokenAddress ,bool isAdd) public{
        if (isAdd){
            Reserve temp = Reserve(reserveAddress);
            listReserves[tokenAddress]= temp;
        }else{
            delete(listReserves[tokenAddress]);
        }
    }
    function setExchangeRate(address tokenAddress,uint buyRate, uint sellRate) public onlyOwner{
        listReserves[tokenAddress].setExchangeRates(buyRate, sellRate);
    }
    function getExchangeRate(address srcToken, address destToken, uint amount) public view returns(uint){
        if (destToken == srcToken){
            return 1;
        }
        if (destToken != addressEth && srcToken!= addressEth){
            Reserve reserveDest = listReserves[destToken];
            Reserve reserveSrc = listReserves[srcToken];
            
            uint rateSellToSrc = reserveSrc.getExchangeRate(false);
            uint rateBuyFromDest = reserveDest.getExchangeRate(true);
            uint rate1 = (amount*(10**18)/rateSellToSrc)*rateBuyFromDest;
            return rate1;
        }
        if (srcToken == addressEth){
            //swap from eth to custom token ~ buy token
            Reserve reserve =  listReserves[destToken];
            uint rate = amount*(10**18)/reserve.getExchangeRate(true);
            return rate;
        }
        if (destToken == addressEth){
            //swap from custom token to eth
            reserve =  listReserves[srcToken];
            rate = amount * (10**18)*reserve.getExchangeRate(false);
            return rate;
        }
    }
    function exchangeTokens(address srcToken, address destToken, uint amount) public payable{
        if (destToken == srcToken){
            return;
        }
        if (destToken != addressEth && srcToken!= addressEth){
            Reserve reserve1 = listReserves[srcToken];
            uint amountEth = reserve1.exchange(false, amount);
            reserve1 = listReserves[destToken];
            reserve1.exchange(true, amountEth);
            ERC20(destToken).transfer(msg.sender, amount);
        }
        if (srcToken == addressEth){
            //swap from eth to custom token
            require((msg.value) == (amount*(10**18)));
            Reserve reserve =  listReserves[destToken];
            reserve.exchange(true, amount);
            ERC20(destToken).transfer(msg.sender, amount);
        }
        if (destToken == addressEth){
            //swap from custom token to eth
            reserve =  listReserves[srcToken];
            reserve.exchange(false, amount);
            msg.sender.transfer(amount*(10**18));  
        }
    }
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    event Transfer(address indexed from, address indexed to, uint tokens);
}