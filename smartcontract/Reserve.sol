pragma solidity ^0.4.17;
// import "./Atuan.sol";
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
    
    Token public token;

    // function Reserve( bool _tradeFlag, address _tokenAddress, uint _buyRate, uint _sellRate) public{
    //     owner = msg.sender;
        
    //     tradeFlag = _tradeFlag;
        
    //     token.addressToken = _tokenAddress;
    //     token.buyRate = _buyRate;
    //     token.sellRate = _sellRate;
    // }
    function Reserve() public{
        owner = msg.sender;
        
        tradeFlag = true;
        
        token.addressToken = 0xe931a8a8682ab3a66e247fcf560f1ce6e8dd0b2b;
        token.buyRate = 2;
        token.sellRate = 1;
    }
    
    function withdraw(address tokenAddress, uint amount) public onlyOwner {
        if (tokenAddress == token.addressToken){
            // fund.token -= amount;
            ERC20(token.addressToken).transfer(msg.sender, amount*(10**18));
            // msg.sender.transfer(amount);
            
        }else{
            // fund.eth -= amount*(10**18);
            // ERC20(addressEth).transfer(msg.sender, amount);
            // address(this).transfer(amount);
            msg.sender.transfer(amount*(10**18));
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
        token.buyRate = buyRate;
        token.sellRate = sellRate;
    }
    function setTradeFlag(bool value) public onlyOwner{
        tradeFlag = value;
    }
    
    function exchange(bool _isBuy, uint amount) payable public{
        if (_isBuy){
            // fund.eth += amount*token.buyRate;
            // fund.token -= amount;
            // ERC20(token.addressToken).transfer(msg.sender, amount*token.buyRate);
            
            require(msg.value == amount);
            ERC20(token.addressToken).transfer(msg.sender, amount*(10**18)*token.buyRate);
        }else{
            // fund.token += amount*token.sellRate;
            // fund.eth -= amount;
            // ERC20(addressEth).transfer(msg.sender, amount*token.sellRate);
            ERC20 defaulToken = ERC20(token.addressToken);
            defaulToken.transferFrom(msg.sender, address(this), amount);
            msg.sender.transfer(amount*(10**18)**token.sellRate);  
        }
    }

    function depositEth() payable public onlyOwner{
        // fund.eth+=uint256(msg.value);
    }
    function depositToken(uint256 amount) public onlyOwner{
        ERC20 defaulToken = ERC20(token.addressToken);
        require(amount <= defaulToken.allowance(msg.sender, address(this)));
        defaulToken.transferFrom(msg.sender, address(this), amount);
    
        // fund.token+=amount;

    }
    
    function getBalance()public view returns(uint){
        return this.balance;
    }
    
    function getBalanceToken() public view  returns(uint){
        uint256 amount = ERC20(token.addressToken).balanceOf(address(this));
        return amount;
        
    }
    
    
    function () payable public {}
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }
    modifier requireFlag(){
        require(tradeFlag == true);
        _;
    }
}