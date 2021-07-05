// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");
fs = require('fs');

const cfg = require("../proxy_adresses.json");

async function main() {

  const PortalPaySplitter = await ethers.getContractFactory("PortalPaySplitter");

  console.log("Upgrading PortalPaySplitter...");
  await upgrades.upgradeProxy( cfg.PortalPaySplitter, PortalPaySplitter);
  console.log("PortalPaySplitter upgraded sucessfuly!");

}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
