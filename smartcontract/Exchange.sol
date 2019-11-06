pragma solidity ^0.4.17;
import './Reserve.sol';
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
            Reserve temp = new Reserve(0,0,true,tokenAddress,1,1);
            listReserves[reserveAddress]= temp;
        }else{
            delete(listReserves[reserveAddress]);
        }
    }
    function getExchangeRate(address srcToken, address destToken, uint amount) public returns(uint){
        if (destToken == srcToken){
            return 1;
        }
        if (destToken != addressEth && srcToken!= addressEth && destToken != addressEth && srcToken != addressEth){
            Reserve reserve1 = listReserves[srcToken];
            uint rate1 = reserve1.getExchangeRate(false, amount);
            reserve1 = listReserves[destToken];
            rate1 = reserve1.getExchangeRate(true, rate1);
            return rate;
        }
        if (srcToken == addressEth){
            //swap from eth to custom token
            Reserve reserve =  listReserves[destToken];
            uint rate = reserve.getExchangeRate(true, amount);
            return rate;
        }
        if (destToken == addressEth){
            //swap from custom token to eth
            reserve =  listReserves[srcToken];
            rate = reserve.getExchangeRate(false, amount);
            return rate;
        }
    }
    function exchangeTokens(address srcToken, address destToken, uint amount) public{
        if (destToken == srcToken){
            return;
        }
        if (destToken != addressEth && srcToken!= addressEth && destToken != addressEth && srcToken != addressEth){
            Reserve reserve1 = listReserves[srcToken];
            reserve1.exchange(false, amount);
            reserve1 = listReserves[destToken];
            reserve1.exchange(true, amount);
            return rate;
        }
        if (srcToken == addressEth){
            //swap from eth to custom token
            Reserve reserve =  listReserves[destToken];
            uint rate = reserve.exchange(true, amount);
            return rate;
        }
        if (destToken == addressEth){
            //swap from custom token to eth
            reserve =  listReserves[srcToken];
            rate = reserve.exchange(false, amount);
            return rate;
        }
    }
}