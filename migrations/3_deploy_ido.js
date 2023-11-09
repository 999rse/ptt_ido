const IDOToken = artifacts.require("IDOToken");
const PolyTechToken = artifacts.require("PolyTechToken");

const fs = require('fs');
const jsonContent = fs.readFileSync('../deploy_param.json', 'utf-8');
const param = JSON.parse(jsonContent);

module.exports = async function (deployer, network, accounts) {
    const NTransferTokens = param.NUMBER_OF_TOKENS_TRANSFER;
    const rate = param.RATE; // Цена за 1 токен
    const startTime = param.START_TIME_IDO;
    const endTime = param.END_TIME_IDO;

    // Адрес смарт-контракта PolyTechToken, развернутого в предыдущей миграции
    const polyTechTokenInstance = await PolyTechToken.deployed();
    const polyTechTokenAddress = polyTechTokenInstance.address;

    // Владелец смарт-контракта IDOToken
    const newOwner = accounts[param.INITIAL_OWNER_IDO_CONTRACT];

    // Развертывание смарт-контракта IDOToken с новым (или старым) владельцем
    await deployer.deploy(IDOToken, polyTechTokenAddress, rate, startTime, endTime);
    const idoTokenInstance = await IDOToken.deployed();

    // Передача N токенов с PolyTechToken на IDOToken
    await polyTechTokenInstance.transfer(idoTokenInstance.address, NTransferTokens);

    // Передача владельца смарт-контракта IDOToken на новый аккаунт
    await idoTokenInstance.transferOwnership(newOwner);
};
