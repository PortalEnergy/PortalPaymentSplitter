// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");
fs = require('fs');

async function main() {

  const proxy_adresses =  {
    PEToken: null,
    PortalPaySplitter: null
  }

  const PEToken = await ethers.getContractFactory("PEToken");
  const PortalPaySplitter = await ethers.getContractFactory("PortalPaySplitter");

  console.log("Deploying PEToken...");
  const PETokenDeploy = await upgrades.deployProxy(PEToken, ["PEToken", "POE"]);
  await PETokenDeploy.deployed()
  console.log("PEToken deployed to:", PETokenDeploy.address);
  proxy_adresses.PEToken = PETokenDeploy.address;

  
  console.log("Deploying PortalPaySplitter...");
  const PortalPaySplitterDeploy = await upgrades.deployProxy(PortalPaySplitter, [PETokenDeploy.address]);
  await PortalPaySplitterDeploy.deployed();
  proxy_adresses.PortalPaySplitter = PortalPaySplitterDeploy.address;
  console.log("PortalPaySplitter deployed to:", PortalPaySplitterDeploy.address);

  fs.writeFile(__dirname+"/../proxy_adresses.json", JSON.stringify(proxy_adresses, null, "\t"), function (err) {
    if (err) return console.log(err);
    else console.log("Save to proxy_adresses.json")
  });

}

main()
