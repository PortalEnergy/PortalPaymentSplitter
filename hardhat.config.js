require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");
const fs = require('fs');
const { task } = require("hardhat/config");

const mnemonic = fs.readFileSync('.mnemonic', 'utf8')


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


task("portal", "test deployed contracts", async () => {
   //const provider = new ethers.providers.JsonRpcProvider();
  const PortalPaySplitterABI = require('./artifacts/contracts/PEToken.sol/PEToken.json');
  const contractAddress = "0x8A93d247134d91e0de6f96547cB0204e5BE8e5D8";
 
  const accounts = await ethers.getSigners();
  const contract = new ethers.Contract(contractAddress, PortalPaySplitterABI.abi, accounts[0]);

  let tx = await contract.transfer("0x602A44E855777E8b15597F0cDf476BEbB7aa70dE", ethers.utils.parseEther("200.000"), { from: accounts[0].address });
  await tx.wait();
  console.log(tx)

  await accounts[0].sendTransaction(
    {
        to:"0x602A44E855777E8b15597F0cDf476BEbB7aa70dE", 
        value:ethers.utils.parseEther("1") 
    }
  );
})


task("portal:distribute", "Distribute ETH", async () => {

  const PortalPaySplitterABI = require('./artifacts/contracts/PortalPaySplitter.sol/PortalPaySplitter.json');
  const contractAddress = "0x40918Ba7f132E0aCba2CE4de4c4baF9BD2D7D849";

  const accounts = await ethers.getSigners();
  const contract = new ethers.Contract(contractAddress, PortalPaySplitterABI.abi, accounts[0]);

  let tx = await accounts[0].sendTransaction(
    {
        to:contractAddress, 
        value:ethers.utils.parseEther("1") 
    }
  );

  tx.wait();
  
  const distribute = await contract.distribute()
  distribute.wait();
  console.log(distribute)

})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "bscTestnet",
  gasReporter: {
    currency: 'USD',
    gasPrice: 21
  },
  networks : {
    mainet: {
      gasPrice: 38000000000,
      url: "https://mainnet.infura.io/v3/1335e00660a14b1ba6510a68a259a08e",
      accounts: {
        mnemonic: mnemonic
      }
    },
    hardhat: {
      accounts: {
        count: 2
      }
    },
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      network_id: 97,
      chainId: 97,
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonic},
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org",
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    localhost: {
      chainId: 31337
    }
  },
  mocha: {
    timeout: 20000000
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};

