// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// contract IDOToken is Ownable {
//     IERC20 public TOKEN;
//     uint public RATE;
//     uint public totalTokensSold;
//     uint public startTime;
//     uint public endTime;
//     bool public idoFinished = false;

//     mapping(address => uint) public purchasedTokens;

//     event TokensPurchased(address indexed buyer, uint amount, uint cost);
    
//     constructor(address _token, uint _rate, uint256 _startTime, uint256 _endTime) Ownable(msg.sender) {
//         TOKEN = IERC20(_token);
//         RATE = _rate;
//         startTime = _startTime;
//         endTime = _endTime;
//     }

//     modifier duringIDO() {
//         require(block.timestamp >= startTime && block.timestamp <= endTime, "IDO is not active");
//         _;
//     }

//     function getBalanceToken() public view returns (uint balance) {
//         balance = TOKEN.balanceOf(address(this));
//     }

//     function getBalanceEther() public view returns (uint balanceEther) {
//         balanceEther = address(this).balance;
//     }

//     // function finishIDO() external onlyOwner {
//     //     require(block.timestamp > endTime, "IDO is still active");
        
//     //     // Сжигание оставшихся токенов
//     //     uint remainingTokens = getBalanceToken();
//     //     if (remainingTokens > 0) {
//     //         TOKEN.transfer(address(0), remainingTokens);
//     //     }

//     //     // Отправка денег на аккаунт владельца контракта по окончанию IDO
//     //     payable(owner()).transfer(getBalanceEther());
//     // }

//     function purchaseTokens() external duringIDO payable {
//         require(msg.value > 0, "Must send ETH to purchase tokens");
//         uint tokenAmount = msg.value / RATE;
//         uint availableTokens = getBalanceToken();

//         // Calculate the actual cost based on the available tokens
//         uint cost = tokenAmount * RATE;

//         if (tokenAmount > availableTokens) {
//             // If the requested token amount exceeds the available tokens, reject the transaction
//             revert("Not enough tokens");
//         }

//         // Check if the sender sent more ETH than needed
//         if (msg.value > cost) {
//             // Calculate the excess amount of ETH
//             uint excessEth = msg.value - cost;

//             // Return the excess ETH to the sender
//             payable(msg.sender).transfer(excessEth);
//         }

//         purchasedTokens[msg.sender] += tokenAmount;
//         totalTokensSold += tokenAmount;

//         emit TokensPurchased(msg.sender, tokenAmount, cost);
//     }

//     function claimPurchasedTokens() external {
//         //require(block.timestamp > endTime, "IDO is still active");
//         uint tokenAmount = purchasedTokens[msg.sender] * RATE; // ADD: / RATE 
//         require(tokenAmount > 0, "No purchased tokens for the sender");

//         purchasedTokens[msg.sender] = 0;
//         TOKEN.transfer(msg.sender, tokenAmount);
//     }
// }



// <------------------------------------------------------------------------------------------------------->



contract IDOToken is Ownable {
    IERC20 public TOKEN; // Инициализация токена из Token.sol
    uint public RATE; // Рейт обмена в wei
    uint public totalTokensSold; // Общее количество проданых токенов
    uint public startTime; // Начало торгов
    uint public endTime; // Окончание торгов

    mapping(address => uint) public purchasedTokens; // Баланс купленных токенов для каждого адреса

    event TokensPurchased(address indexed buyer, uint amount, uint cost); // Уведомление о покупке токена

    constructor(address _token, uint _rate, uint _startTime, uint _duration) Ownable(msg.sender) {
        TOKEN = IERC20(_token);
        RATE = _rate;
        startTime = _startTime;
        endTime = _startTime + _duration;
    }

    modifier duringIDO() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "IDO is not active");
        _;
    }

    function getBalanceToken() public view returns (uint balance) {
        balance = TOKEN.balanceOf(address(this));
    }

    function getBalanceEther() public view returns (uint balanceEther) {
        balanceEther = address(this).balance;
    }

    function setToken(address token_) external onlyOwner {
        require(token_ != address(0));
        TOKEN = IERC20(token_);
    }

    function setRate(uint rate_) external onlyOwner {
        require(rate_ > 0);
        RATE = rate_;
    }

    function withdrawTokens() external onlyOwner duringIDO {
        require(block.timestamp > endTime, "IDO is still active");
        require(getBalanceToken() > 0, "Not enough tokens");
        TOKEN.transfer(owner(), getBalanceToken());
    }

    function withdrawEther() external onlyOwner duringIDO {
        require(block.timestamp > endTime, "IDO is still active");
        require(getBalanceEther() > 0, "Not enough ether");
        payable(owner()).transfer(getBalanceEther());
    }

    function purchaseTokens() external duringIDO payable {
        require(msg.value > 0, "Must send ETH to purchase tokens");
        uint tokenAmount = msg.value / RATE;
        require(getBalanceToken() >= tokenAmount, "Not enough tokens");

        // Удерживаем купленные токены для адреса покупателя
        purchasedTokens[msg.sender] += tokenAmount;
        totalTokensSold += tokenAmount;

        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    function claimPurchasedTokens() external {
        //require(block.timestamp > endTime, "IDO is still active");
        uint tokenAmount = purchasedTokens[msg.sender];
        require(tokenAmount > 0, "No purchased tokens for the sender");

        purchasedTokens[msg.sender] = 0; // Сбрасываем баланс
        TOKEN.transfer(msg.sender, tokenAmount);
    }

    function finishIDO() external onlyOwner {
        require(block.timestamp > endTime, "IDO is still active");
        uint remainingTokens = getBalanceToken();
        require(remainingTokens > 0, "No remaining tokens to transfer");
        
        // Действия для завершения IDO: передача остаточных токенов владельцу.
        TOKEN.transfer(owner(), remainingTokens);

        // Передача отправленых денег на контракт IDO владельцу данного
        require(getBalanceEther() > 0, "Not enough ether");
        payable(owner()).transfer(getBalanceEther());
    }
}

// <------------------------------------------------------------------------------------------------------->


// Previous
// without holding tokens



// contract IDOToken is Ownable {
//     IERC20 public TOKEN; // Инициализацияя токена из Token.sol
//     uint public RATE; // Рейт обмена в wei
//     uint public totalTokensSold; // Общее количество проданых токенов
//     uint public startTime; // Начало торгов
//     uint public endTime; // Окончание торгов

//     event TokensPurchased(address indexed buyer, uint amount, uint cost); // Уведомление о покупке токена

//     constructor(address _token, uint _rate, uint _startTime, uint _duration) Ownable(msg.sender) {
//         TOKEN = IERC20(_token);
//         RATE = _rate;
//         startTime = _startTime;
//         endTime = _startTime + _duration;
//     }

//     modifier duringIDO() {
//         require(block.timestamp >= startTime && block.timestamp <= endTime, "IDO is not active");
//         _;
//     }

//     function getBalanceToken () public view returns(uint balance) {
//         balance = TOKEN.balanceOf(address(this));
//     }

//     function getBalanceEther () public view returns(uint balanceEther) {
//         balanceEther = address(this).balance;
//     }

//     function setToken(address token_) external onlyOwner {
//         require(token_ != address(0));
//         TOKEN = IERC20(token_);
//     }

//     function setRate(uint rate_) external onlyOwner {
//         require(rate_ > 0);
//         RATE = rate_;
//     }

//     function withdrawTokens() external  onlyOwner duringIDO {
//         require(getBalanceToken() > 0, "Not enough tokens");
//         TOKEN.transfer(owner(), getBalanceToken());
//     }

//     function withdrawEther() external  onlyOwner duringIDO {
//         require(getBalanceEther() > 0, "Not enough eter");
//         payable(owner()).transfer(getBalanceEther());
//     }

//     function purchaseTokens() external duringIDO payable {
//         require(msg.value > 0, "Must send ETH to purchase tokens");
//         uint tokenAmount = msg.value / RATE;
//         require(getBalanceToken() >= tokenAmount, "Not enough tokens");

//         TOKEN.transfer(msg.sender, tokenAmount);
//         totalTokensSold += tokenAmount;

//         emit TokensPurchased(msg.sender, tokenAmount, msg.value);
//     }

//     function sellTokens(uint _amount) external duringIDO {
//         uint allowanceToken = TOKEN.allowance(msg.sender, address(this));
//         uint valueEther = _amount * RATE;
//         require(allowanceToken >= _amount, "Not approved tokens");
//         require(address(this).balance >= valueEther, "Not enough ETH in contract");

//         TOKEN.transferFrom(msg.sender, address(this), _amount);
//         payable(msg.sender).transfer(valueEther);
//     }

//     function finishIDO() external onlyOwner duringIDO {
//         require(block.timestamp > endTime, "IDO is still active");
//         uint remainingTokens = getBalanceToken();
//         require(remainingTokens > 0, "No remaining tokens to transfer");
        
//         // Действия для завершения IDO: передача остаточных токенов владельцу.
//         TOKEN.transfer(owner(), remainingTokens);
//     }
// }