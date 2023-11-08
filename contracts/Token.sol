// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PolyTechToken is ERC20, Ownable {
    constructor(address initialOwner, uint totalSupply) ERC20("PolyTechToken", "PTT") Ownable(initialOwner) {
        _mint(msg.sender, totalSupply * 10 ** decimals());
    }
    function decimals() public pure override returns ( uint8 ) { 
        return 0;
    }

    // Функция для отправки токенов с баланса отправителя на другой адрес
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(to != address(0), "Invalid address");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, to, amount);
        return true;
    }

    // Функция для отправки токенов с определенного адреса на другой адрес (при наличии разрешения)
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        _transfer(from, to, amount);
        _approve(from, _msgSender(), allowance(from, _msgSender()) - amount);
        return true;
    }

    // Функция для установки разрешения (например, для `transferFrom`)
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    // Функция для изменения владельца контракта
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Invalid address");
        _transferOwnership(newOwner);
    }
}
