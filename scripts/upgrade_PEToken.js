// scripts/deploy_upgradeable_box.js
const { ethers, upgrades } = require("hardhat");
fs = require('fs');

const PETokenAddress = "0x8eA9a18A98E5cDbE93cacEa82Ea3e9c2CB8Dc520";

async function main() {

  const accounts = await ethers.getSigners();

  const PETokenv2 = await ethers.getContractFactory("PEToken");

  console.log("Upgrading PEToken...");
  const contract = await upgrades.upgradeProxy( PETokenAddress, PETokenv2);
  console.log("PEToken upgraded sucessfuly!");


//  const POE = require('../artifacts/contracts/PEToken.sol/PEToken.json');

//  const accounts = await ethers.getSigners();
//  const contract = new ethers.Contract(PETokenAddress, POE.abi, accounts[0]);

/*   const tx = await contract.transferOwnership(accounts[0].address);
  await tx.wait(); */

  const owner = await contract.owner()

  if(owner == accounts[0].address){
    console.log("Owner set successfuly!")
  }



}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
