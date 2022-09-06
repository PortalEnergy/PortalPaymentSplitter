const { ethers, upgrades } = require('hardhat');
const Rate = "1.2";
const minTokenBuy = "10";
const PETokenAddress = "0x8eA9a18A98E5cDbE93cacEa82Ea3e9c2CB8Dc520";
async function main () {
  const accounts = await ethers.getSigners();
  const owner = accounts[0].address;

  const Crowdsale = await ethers.getContractFactory('Crowdsale');
  console.log('Deploying Crowdsale...');

  const crowdsale = await upgrades.deployProxy(Crowdsale, [ethers.utils.parseEther(Rate).toString(), owner, PETokenAddress, ethers.utils.parseEther(minTokenBuy).toString()]);
  await crowdsale.deployed();
  console.log('Crowdsale deployed to:', crowdsale.address);
}

main();