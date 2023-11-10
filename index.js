const { ethers } = require("ethers");

// OWNER CONTRACT ADDRESS IDO !!!
const OWNER_CONTRACT_ADDRESS_IDO = "0xCCB4397F3Bf63a55d442852e2Ee8B32E87681377";


// Адрес контракта IDO и его ABI
const CONTRACT_ADDRESS_IDO = "0x1b2d83cE6Eda222f8ED85d9ea08976e437FAcd0F"//"0x9f06F880fC68369079b059F0648fC025f16bB36b";
const ABI_IDO = require('./abi/abi_ido_token.json');

// Адрес контракта токена и его ABI
const CONTRACT_ADDRESS_TOKEN = "";
const ABI_TOKEN = require('./abi/abi_token.json');

// Функция для отображения адреса пользователя и подключения
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      // Запрашиваем доступ к аккаунту
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        // Отображаем сокращенный адрес пользователя
        document.getElementById("connectButton").innerHTML = shortenAddress(userAddress);

        // Сохраняем адрес пользователя в localStorage
        localStorage.setItem("userAddress", userAddress);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("connectButton").innerHTML = "Please install MetaMask";
  }
}

// Функция для сокращения адреса
function shortenAddress(address) {
  if (address.length > 8) {
    return address.slice(0, 4) + "..." + address.slice(-4);
  } else {
    return address;
  }
}
// Проверяем, есть ли сохраненный адрес пользователя в localStorage и отображаем его
const savedUserAddress = localStorage.getItem("userAddress");
if (savedUserAddress) {
  document.getElementById("connectButton").innerHTML = shortenAddress(savedUserAddress);
}

// Обработчик для кнопки подключения
document.getElementById("connectButton").addEventListener("click", connect);


// Покупка токенов в eth
async function purchaseTokens() {
  if (typeof window.ethereum !== "undefined") {
      const etherAmount = parseFloat(prompt("Please enter the amount in Ether you wish to invest in tokens:")); // Запрос пользователю указать количество токенов
      if (isNaN(etherAmount) || etherAmount <= 0) {
          alert("Please enter a valid number of tokens.");
          return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

      try {
          const availableFrozenTokens = await contract.getBalanceToken();
          const transaction = await contract.purchaseTokens({ value: ethers.utils.parseEther(String(etherAmount)) });
          await transaction.wait();

          // После успешной покупки, обновляем информацию о балансе и замороженных токенах
          displayUserTokenBalance();
          // Проверяем, остались ли еще замороженные токены после покупки
          if (availableFrozenTokens - etherAmount <= 0) {
              document.getElementById("purchaseTokensButton").disabled = true; // Отключаем кнопку, если замороженных токенов не осталось
          }
      } catch (error) {
          console.log(error);
      }
  } else {
      document.getElementById("purchaseTokensButton").innerHTML = "Please install MetaMask";
  }
}

// Вывод токенов на кошелек MetaMask, после окончания IDO
async function withdrawTokens() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);
    
    try {
      const transaction = await contract.claimPurchasedTokens();
      await transaction.wait();
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("withdrawTokensButton").innerHTML =
      "Please install MetaMask";
  }
}

// <-----------------  Получение различных балансов ----------------->

// Отображение RATE
async function displayRate() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

    const RATE = await contract.getRate();
    const wei2eth = RATE / 1000000000000000000;

    try {
      const contractRateElement = document.getElementById("contractRate");
      contractRateElement.textContent = "Rate [eth/ptt]: " + wei2eth;
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("contractRate").innerHTML = "Please install MetaMask";
  }
}
// Сколько всего доступно токенов в eth
async function displayTotalTokensInEth() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

    const RATE = await contract.getRate();
    const wei2eth = RATE / 1000000000000000000;

    try {
      const totalTokens = await contract.getBalanceToken() - await contract.totalFrozenTokens();;
      const totalTokensInEth = totalTokens * wei2eth;
      const totalTokensInEthElement = document.getElementById("totalTokensInEth");
      totalTokensInEthElement.textContent = "Total available tokens in eth: " + totalTokensInEth.toString();
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("totalTokensInEth").innerHTML = "Please install MetaMask";
  }
}
// Сколько всего доступно токенов для продажи (показывает сколько токенов не заморожено)
async function displayTotalFrozenTokens() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

    try {
      const totalFrozenTokens = await contract.getBalanceToken() - await contract.totalFrozenTokens();
      const totalFrozenTokensElement = document.getElementById("totalFrozenTokens");
      totalFrozenTokensElement.textContent = "Total available tokens: " + totalFrozenTokens.toString();
    } catch (error) {
      console.log(error);
    }
  } else {
      document.getElementById("totalFrozenTokens").innerHTML = "Please install MetaMask";
  }
}

// Сколько есть токенов у пользователя
async function displayUserTokenBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

    try {
      const purchasedTokens = await contract.purchasedTokens(signer.getAddress());
      const userTokensElement = document.getElementById("userTokens");
      userTokensElement.textContent = "Token balance: " + purchasedTokens.toString();
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("userTokens").innerHTML = "Please install MetaMask";
  }
}

// Timer
let daysElement = document.getElementById("days");
let hoursElement = document.getElementById("hours");
let minutesElement = document.getElementById("minutes");
let statusElement = document.getElementById("status");

async function updateTimer() {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, provider);
  try {
    const startTime = await contract.startTime();
    const endTime = await contract.endTime();

    const now = Math.floor(Date.now() / 1000);  // Текущее время в секундах

    if (now < startTime) {
        // IDO еще не начался
        displayTimeRemaining(startTime - now);
        displayStatus("IDO will start in:");
    } else if (now < endTime) {
        // IDO идет
        displayTimeRemaining(endTime - now);
        displayStatus("IDO will end in:");
    } else {
        // IDO закончился
        displayTimeRemaining(0);
        displayStatus("IDO is finished!");
    }
  } catch (error) {
    console.log(error);
  }
}
setInterval(updateTimer, 1000);

function displayTimeRemaining(timeInSeconds) {
    const days = Math.floor(timeInSeconds / (24 * 60 * 60));
    const hours = Math.floor((timeInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeInSeconds % (60 * 60)) / 60);

    daysElement.textContent = days + ' d';
    hoursElement.textContent = hours + ' h';
    minutesElement.textContent = minutes + ' min';
}

function displayStatus(message) {
    statusElement.textContent = message;
}


// <-----------------  ADMIN FUNCTION ----------------->

async function burnTokens() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

    try {
      const now = Math.floor(Date.now() / 1000); // текущее время в секундах
      const burnT = await contract.withdrawTokens({ gasLimit: 3000000, value: 0});
      await burnT.wait();
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("burnTokensButton").innerHTML = "Please install MetaMask";
  }
}


async function autoUpdateTokenBalances() {
  while (true) {
    displayTotalFrozenTokens();
    displayTotalTokensInEth();
    displayUserTokenBalance();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Обновление баланса каждую секунду
  }
}



// Исполняемые функции
autoUpdateTokenBalances();
displayRate();
updateTimer();
displayTotalFrozenTokens();

module.exports = {
  connect,
  purchaseTokens,
  withdrawTokens,
  displayRate,
  displayTotalTokensInEth,
  displayUserTokenBalance,
  displayTotalFrozenTokens,
  //admin
  burnTokens,
};