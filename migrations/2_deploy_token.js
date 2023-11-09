const PolyTechToken = artifacts.require("PolyTechToken");

const fs = require('fs');
const jsonContent = fs.readFileSync('../deploy_param.json', 'utf-8');
const param = JSON.parse(jsonContent);

module.exports = function (deployer, network, accounts) {
  const initialOwner = accounts[param.INITIAL_OWNER_TOKEN_CONTRACT]; // нулевой аккаунт (первый аккаунт)
  const totalSupply = param.TOTAL_SUPPLY; // общее количество токенов

  deployer.deploy(PolyTechToken, initialOwner, totalSupply);
};
