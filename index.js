const { ethers } = require("ethers");

// OWNER CONTRACT ADDRESS IDO !!!
const OWNER_CONTRACT_ADDRESS_IDO = "0xB9C15e5BEA07AA2FD486dc0A62726fEb38dE24eD".toLowerCase();

// Адрес контракта IDO и его ABI
const CONTRACT_ADDRESS_IDO = "0xF0303e9aaA1FF177d40e9A84e45C761fDc4Da539"
const ABI_IDO = require('./abi/abi_ido_token.json');

// Адрес контракта токена и его ABI
const CONTRACT_ADDRESS_TOKEN = "";
const ABI_TOKEN = require('./abi/abi_token.json');

// Функция для отображения адреса пользователя и подключения
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length > 0) {
        const userAddress = accounts[0];
        document.getElementById("connectButton").innerHTML = shortenAddress(userAddress);
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
async function purchaseTokens(etherAmount) {
  if (typeof window.ethereum !== "undefined") {
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

// <----------------- Получение различных балансов ----------------->

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
      contractRateElement.innerHTML = "Rate [eth/ptt]<br>" + wei2eth;
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
      totalTokensInEthElement.innerHTML = "Total available tokens in eth<br>" + totalTokensInEth.toString();
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
      totalFrozenTokensElement.innerHTML = "Total available tokens<br>" + totalFrozenTokens.toString();
    } catch (error) {
      console.log(error);
    }
  } else {
      document.getElementById("totalFrozenTokens").innerHTML = "Please install MetaMask";
  }
}

// Сколько есть токенов у пользователя
async function displayUserTokenBalance() {
  // Проверка на вход в аккаунт MetaMask
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });

  if (accounts.length === 0) {
    return;
  }

  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    try {
      const userAddress = accounts[0];

      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

      try {
        const purchasedTokens = await contract.purchasedTokens(userAddress);
        const userTokensElement = document.getElementById("userTokens");

        // Отображаем поле только после успешного запроса и получения данных
        userTokensElement.innerHTML = "Your token balance<br>" + purchasedTokens.toString();
        userTokensElement.style.display = "block";
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("userTokens").innerHTML = "Please install MetaMask";
  }
}

// Вызываем функцию при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
  displayUserTokenBalance();
});



// <----------------- TIMER ----------------->
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


// <----------------- ADMIN FUNCTION ----------------->

// Status of admin's buttons
if (savedUserAddress === OWNER_CONTRACT_ADDRESS_IDO){
  document.getElementById("admin_functions").style.display = "block";
  document.getElementById("burnTokensButton_admin").style.display = "block";
  document.getElementById("withdrawEtherButton_admin").style.display = "block";
} else {
  document.getElementById("admin_functions").style.display = "none";
  document.getElementById("burnTokensButton_admin").style.display = "none";
  document.getElementById("withdrawEtherButton_admin").style.display = "none";
}

async function burnTokens() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);
    try {
      const burnT = await contract.withdrawTokens({ gasLimit: 3000000, value: 0 });
      await burnT.wait();
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("burnTokensButton_admin").innerHTML = "Please install MetaMask";
  }
}

async function withdrawEther2acc() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);
    try {
      const burnT = await contract.withdrawEther({ gasLimit: 3000000, value: 0 });
      await burnT.wait();
    } catch (error) {
      console.log(error);
    }
  } else {
    document.getElementById("withdrawEtherButton_admin").innerHTML = "Please install MetaMask";
  }
}


// <----------------- CONVERTOR ----------------->


document.addEventListener("DOMContentLoaded", async function () {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545');
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS_IDO, ABI_IDO, signer);

  const RATE = await contract.getRate();

  // Получаем элементы формы
  const etherInput = document.querySelector(".cryptoconverter__pay input");
  const tokenOutput = document.querySelector(".cryptoconverter__receive input");
  const buyButton = document.getElementById("purchaseTokensButton");

  function updateTokens() {
    // Получаем значение введенной суммы в ETH
    const etherAmount = parseFloat(etherInput.value);

    // Проверяем, является ли введенное значение числом
    if (!isNaN(etherAmount) && etherAmount >= 0 || Math.abs(etherAmount) < Number.EPSILON) {
      // Вычисляем количество токенов
      const tokenAmount = etherAmount / RATE * 1000000000000000000;

      // Выводим количество токенов в соответствующее поле
      tokenOutput.value = tokenAmount;
    }
  }

  // Добавляем обработчик события для поля ввода при вводе
  etherInput.addEventListener("input", updateTokens);

  // Добавляем обработчик события для поля ввода при изменении
  etherInput.addEventListener("change", updateTokens);

  // Добавляем обработчик события для кнопки
  buyButton.addEventListener("click", async function () {
    const etherAmount = parseFloat(etherInput.value);
    await purchaseTokens(etherAmount);
    console.log("Invest button clicked");
  });
});

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
  burnTokens,
  withdrawEther2acc,
};