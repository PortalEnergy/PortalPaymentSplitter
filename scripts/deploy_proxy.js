// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");
const holderAccounts = readHolderAccounts();
const holderAccountsSum = sumAmountHolders(holderAccounts);
const migrateData = holdersToArray(holderAccounts);

async function main() {

  const proxy_adresses =  {
    PEToken: null,
    PortalPaySplitter: null
  }

  const PEToken = await ethers.getContractFactory("PEToken");


  console.log("Deploying PEToken...");
  const PETokenDeploy = await upgrades.deployProxy(PEToken, ["PortalEnergyToken", "POE", holderAccountsSum]);
  await PETokenDeploy.deployed();
  
  console.log("PEToken deployed to:", PETokenDeploy.address);
  proxy_adresses.PEToken = PETokenDeploy.address;

  
  console.log("Deploying PortalPaySplitter...");
  const PortalPaySplitter = await ethers.getContractFactory("PortalPaySplitter");
  const PortalPaySplitterDeploy = await upgrades.deployProxy(PortalPaySplitter, [PETokenDeploy.address, migrateData.accounts, migrateData.balances]);
  await PortalPaySplitterDeploy.deployed();
  proxy_adresses.PortalPaySplitter = PortalPaySplitterDeploy.address;
  console.log("PortalPaySplitter deployed to:", PortalPaySplitterDeploy.address);


  fs.writeFile(__dirname+"/../proxy_adresses.json", JSON.stringify(proxy_adresses, null, "\t"), function (err) {
    if (err) return console.log(err);
    else console.log("Save to proxy_adresses.json")
  });

}


function readHolderAccounts() {
  let holdersRaw = fs.readFileSync(path.join(__dirname, '../token_holders.csv')).toString().split('\n');
  let holdersAccounts = [];


  for (let index = 0; index < holdersRaw.length; index++) {
      const element = holdersRaw[index].split(',');
      if(element[2])
      holdersAccounts.push({
          address: element[2],
          sbBalance: Number(element[3])
      })
  }
  return holdersAccounts;
}

function holdersToArray(holdersAccounts){
  let result = {
      balances: [],
      accounts: []
  }

  for (let index = 0; index < holdersAccounts.length; index++) {
      const element = holdersAccounts[index];
      result.balances.push(element.sbBalance);
      result.accounts.push(element.address);
  }
  return result;
}

function sumAmountHolders(holderAccounts){
  let sum = 0;
  for (let index = 0; index < holderAccounts.length; index++) {
      const element = holderAccounts[index];
      sum += element.sbBalance;
  }
  console.log(sum)
  return sum;
}

main()
