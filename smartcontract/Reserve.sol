pragma solidity ^0.4.17;

contract ERC20 {
    function totalSupply() public constant returns (uint);
    function balanceOf(address tokenOwner) public constant returns (uint balance);
    function allowance(address tokenOwner, address spender) public constant returns (uint remaining);
    function transfer(address to, uint tokens) public returns (bool success);
    function approve(address spender, uint tokens) public returns (bool success);
    function transferFrom(address from, address to, uint tokens) public returns (bool success);
    event Transfer(address indexed from, address indexed to, uint tokens);
    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
}

contract Reserve{
    //address of owner
    address public owner;
    // tradeFlag = true: allow trading
    bool public tradeFlag;
    //information about custom token
    struct Token{
        address addressToken;
        uint buyRate;
        uint sellRate;
    }
    //address of native token 
    address public constant addressEth = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    
    
    struct Fund{
        uint token;
        uint eth;
    }
    
    Token public token;
    Fund public fund;
    
    function Reserve(uint _numberToken,uint _numberEth, bool _tradeFlag, address _tokenAddress, uint _buyRate, uint _sellRate) public{
        // require(_funds <= msg.value);
        owner = msg.sender;
        // funds = _funds;
        fund.token = _numberToken;
        fund.eth = _numberEth;
        // msg.value -= funds;
        tradeFlag = _tradeFlag;
        token.addressToken = _tokenAddress;
        token.buyRate = _buyRate;
        token.sellRate = _sellRate;
    }
    
    function withdraw(address tokenAddress, uint amount) payable public{
        require(msg.sender == owner);
        if (tokenAddress == token.addressToken){
            fund.token -= amount;
            ERC20(msg.sender).transfer(msg.sender, amount);
            
            msg.sender.transfer(amount);
            
        }else{
            fund.eth -= amount;
            ERC20(msg.sender).transfer(msg.sender, amount);
        }
    }
    
    function getExchangeRate(bool isBuy, uint amount) public returns(uint){
        if (isBuy){
            return token.buyRate;
        }else{
            return token.sellRate;
        }
    }
    
    function setExchangeRates(uint buyRate, uint sellRate) public{
        require(msg.sender == owner);
        token.buyRate = buyRate;
        token.sellRate = sellRate;
    }
    function setTradeFlag(bool value) public{
        require(msg.sender == owner);
        tradeFlag = value;
    }
    
    function exchange(bool _isBuy, uint amount) payable public{
        if (_isBuy){
            fund.eth += amount*token.buyRate;
            fund.token -= amount;
            ERC20(token.addressToken).transfer(msg.sender, amount);
        }else{
            fund.token += amount*token.sellRate;
            fund.eth -= amount;
            ERC20(addressEth).transfer(msg.sender, amount);
        }
    }
}