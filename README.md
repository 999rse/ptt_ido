# PolyTechToken to IDO
This repository contains a minimal set of ready-made files to conduct the initial token deployment. This variant has its own fundraising page and corresponding contracts: token and its IDO.

## Launch rules
Before you can use it, you need to install the packages:
```json 
{
  "dependencies": {
    "@babel/core": "^7.23.2",
    "@openzeppelin/contracts": "^5.0.0",
    "bootstrap": "^5.3.2",
    "browserify": "^17.0.0",
    "ethers": "^5.5.3",
    "solc": "0.8.17",
    "watchify": "^4.0.0",
    "web3": "4.2.1"
  },
  "scripts": {
    "build": "browserify index.js --standalone bundle -o ./dist/bundle.js",
    "watch": "watchify index.js --standalone bundle -o ./dist/bundle.js -v"
  },
  "devDependencies": {
    "babelify": "^10.0.0",
    "http-server": "^14.1.0"
  }
}
```

After clone git repository you should follow this steps:
### Update dependencies
```bash
sudo apt-get update
sudo apt-get upgrade -y
```
### Go to directory
```bash
cd ptech/
sudo apt-get install software-properties-common -y
```
### Add solidity repostory 
```bash
sudo add-apt-repository ppa:ethereum/ethereum
sudo apt-get update
```
### Install npm
```bash
sudo apt-get install npm -y
```
### Install yarn
```bash
npm install --global yarn
```
### Use yarn for install all packages
```bash
yarn
```

## How to use
### Back 
All things are happen in __develop__ network. For use another network, configurate `truffle-config.js`

In first terminal load local blockhain
```bash
ganache --networkId 5777
```

Before deploy setup files in dir _migration_:

* 2_deploy_token.js:
    - initialOwner - Owner account (by default the first in ganache)
    - totalSupply - How many tokens to issue in total
* 3_deploy_ido.js:
    - NTransferTokens - Number of tokens to be transferred to the IDO contract account (must be <= totalSupply)
    - rate - Specified in [wei](https://www.investopedia.com/terms/w/wei.asp). In brief, how much ether must be given to get one token. [Convertor](https://eth-converter.com/) ether to wei.
    - startTime - Time when start IDO. In UNIX Time.
    - endTime - Time when end IDO. In UNIX Time.
    - _Extention_: you can change owner this contract in raw:
        ```javascript
        const newOwner = accounts[0];
        ``` 

In the second terminal start migration
```bash
bash executed/migrate.bash
```

Now, in the second you can see that 2 contracts are deployed. Put contract addres in `3_deploy_ido.js` to index.js in field `CONTRACT_ADDRESS_IDO`.

Here use build page
```bash
yarn build
```

Go to http://127.0.0.1:5501 in your browser.

### Front (Metamask)
[Official meatamask guide: How to add a custom network RPC](https://support.metamask.io/hc/en-us/articles/360043227612-How-to-add-a-custom-network-RPC)

Go to Settings -> Networks -> Add a network -> click to Add a network manually

![add a network manually](pic_doc/metamask_1.png)

Then fill fields as photo down and save.

![fill fields](pic_doc/metamask_config.png)

Import an account: [Official metamask guide](https://support.metamask.io/hc/en-us/articles/360015489331-How-to-import-an-Account)


## Use, debug, Rock and Roll!