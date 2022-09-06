const { expect, assert }   = require('chai');
const { ethers, upgrades } = require("hardhat");
var owner = null;
var accounts = null;

const Tokens = "35000"

before(async function() {

    accounts = await ethers.getSigners();

    owner = accounts[0].address;

    const PEToken = await ethers.getContractFactory("PEToken");

    console.log("Deploying PEToken...");
    const PETokenDeploy = await upgrades.deployProxy(PEToken, ["PEToken", "POE", ethers.utils.parseEther(Tokens).toString()]);

    this.tokenContract = await PETokenDeploy.deployed()
    console.log("PEToken deployed to:", PETokenDeploy.address);

})


describe("Check PEtoken", function(){

    it("check owner", async function(){
        const contractOwner = await this.tokenContract.owner();
        expect(contractOwner).to.equal("0x0000000000000000000000000000000000000000");

        const PETokenv2 = await ethers.getContractFactory("PEToken2");
        const PETokenv2Deploy = await upgrades.upgradeProxy(this.tokenContract.address, PETokenv2);
        console.log("Box upgraded");
        await PETokenv2Deploy.transferOwnership(owner);

        const contractOwnerAfter = await this.tokenContract.owner();
        expect(contractOwnerAfter).to.equal(owner);

    })

})