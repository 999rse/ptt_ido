// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IDOToken is Ownable {
    IERC20 public TOKEN; // Инициализация токена из Token.sol
    uint public RATE; // Рейт обмена в wei
    uint public totalTokensSold; // Общее количество проданых токенов
    uint public startTime; // Начало торгов
    uint public endTime; // Окончание торгов
    uint public totalFrozenTokens; // Общее количества замороженных токенов

    mapping(address => uint) public purchasedTokens; // Баланс купленных токенов для каждого адреса
    mapping(address => uint) public frozenTokens; // Баланс замороженных токенов

    event TokensPurchased(address indexed buyer, uint amount, uint cost); // Уведомление о покупке токена

    constructor(address _token, uint _rate, uint _startTime, uint _endTime) Ownable(msg.sender) {
        TOKEN = IERC20(_token);
        RATE = _rate;
        startTime = _startTime;
        endTime = _endTime;
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

    function getRate() public view returns (uint) {
        return RATE;
    }

    function withdrawTokens() external onlyOwner {
        require(block.timestamp > endTime, "IDO is still active");
        require(getBalanceToken() > 0, "Not enough tokens");
        TOKEN.transfer(owner(), getBalanceToken() - totalFrozenTokens);
    }

    function withdrawEther() external onlyOwner {
        require(block.timestamp > endTime, "IDO is still active");
        require(getBalanceEther() > 0, "Not enough ether");
        payable(owner()).transfer(getBalanceEther());
    }

    function purchaseTokens() external duringIDO payable {
        require(msg.value > 0, "Must send ETH to purchase tokens");
        uint tokenAmount = msg.value / RATE;
        require(getBalanceToken() >= tokenAmount, "Not enough tokens");
        require(totalFrozenTokens + tokenAmount <= getBalanceToken(), "Exceeds available frozen tokens");

        // Уменьшаем количество доступных токенов
        purchasedTokens[msg.sender] += tokenAmount;
        totalTokensSold += tokenAmount;
        totalFrozenTokens += tokenAmount; // Увеличиваем количество замороженных токенов

        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    function claimPurchasedTokens() external {
        require(block.timestamp > endTime, "IDO is still active");
        uint tokenAmount = purchasedTokens[msg.sender];
        require(tokenAmount > 0, "No purchased tokens for the sender");

        purchasedTokens[msg.sender] = 0; // Сбрасываем баланс
        totalFrozenTokens -= tokenAmount; // Уменьшаем количество замороженных токенов
        TOKEN.transfer(msg.sender, tokenAmount);
    }
}