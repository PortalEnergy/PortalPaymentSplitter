const { expect, assert }   =   require('chai');
const { ethers, upgrades, waffle } = require("hardhat");
var owner = null;
var accounts = null;
const Rate = "1.2"
const Tokens = "2000"
const minTokenBuy = "10";
var crowdsaleAddress = "";

before(async function() {

    accounts = await ethers.getSigners();

    owner = accounts[0].address;

    const PEToken = await ethers.getContractFactory("PEToken");

    console.log("Deploying PEToken...");
    const PETokenDeploy = await upgrades.deployProxy(PEToken, ["PEToken", "POE", Tokens]);

    this.tokenContract = await PETokenDeploy.deployed()
    console.log("PEToken deployed to:", PETokenDeploy.address);

    const Crowdsale = await ethers.getContractFactory("Crowdsale");

    console.log("Deploying Crowdsale...");
    const CrowdsaleDeploy = await upgrades.deployProxy(Crowdsale, [ethers.utils.parseEther(Rate).toString(), owner, PETokenDeploy.address, ethers.utils.parseEther(minTokenBuy).toString()]);

    this.crowdsaleContract = await CrowdsaleDeploy.deployed()
    crowdsaleAddress = CrowdsaleDeploy.address;
    console.log("Crowdsale deployed to:", CrowdsaleDeploy.address);


    const transactionTokensAmount =  ethers.utils.parseEther(Tokens);
    


    let tx = await this.tokenContract.transfer(CrowdsaleDeploy.address, transactionTokensAmount, { from: owner });

    await tx.wait()
})


describe("Check Crowdsale", function(){

    
    it("Is contract works", function() { 

        if(!this.crowdsaleContract){
            this.crowdsaleContract = null;
        }

        expect(this.crowdsaleContract).to.not.be.null;
    });

    it("rate()", async function() { 
        const rate = await this.crowdsaleContract.rate();

        expect(rate.toString()).to.equal(ethers.utils.parseEther(Rate).toString());
    })

    it("getTokenRateBNB()", async function() { 
        const rate = await this.crowdsaleContract.getTokenRateBNB();
        expect(Number(rate.toString())).to.above(3568473485390911);
    })

    it("minTokenBuy()", async function() { 
        const _minTokenBuy = await this.crowdsaleContract.minTokenBuy();
        expect(_minTokenBuy.toString()).to.equal(ethers.utils.parseEther(minTokenBuy).toString());
        
        const  changeMinTokenBuy = "100";
        await this.crowdsaleContract.setMinTokenBuy(ethers.utils.parseEther(changeMinTokenBuy).toString());

        const minTokenBuyAfterChange = await this.crowdsaleContract.minTokenBuy();
        expect(minTokenBuyAfterChange.toString()).to.equal(ethers.utils.parseEther(changeMinTokenBuy).toString());
        
    })

    it("buyTokens()", async function(){
        const provider = waffle.provider;
        const balance = await provider.getBalance(owner);
        console.log("\t  Balance owner is ", balance.toString(), owner)
        for (let index = 0; index < accounts.length; index++) {
            await buyTokens(index, this)
        }
    })

    it("get wei rate", async function(){
        const value = "1.5";
        const tokensAmount = await this.crowdsaleContract.getTokenAmount(ethers.utils.parseEther(value));
        const weiAmount = await this.crowdsaleContract.getWeiAmount(tokensAmount);

        expect(weiAmount.toString()).to.equal(ethers.utils.parseEther(value).toString());
    })
})

async function buyTokens(accountFrom, self){
    const value = "1.2879989";
    const tokensBeforePay = await self.tokenContract.balanceOf(accounts[accountFrom].address);
    const tokensOnCrowdsale = await self.tokenContract.balanceOf(self.crowdsaleContract.address);

    console.log("\tTokens contract balance: ", ethers.utils.formatEther(tokensOnCrowdsale))

    expect(tokensBeforePay.toString()).to.equal("0");


    const tokensAmount = await self.crowdsaleContract.getTokenAmount(ethers.utils.parseEther(value));
    await accounts[accountFrom].sendTransaction(
        {
            to:self.crowdsaleContract.address, 
            value:ethers.utils.parseEther(value) 
        }
    );

    const tokensAfterPay = await self.tokenContract.balanceOf(accounts[accountFrom].address);
    console.log("\tTokens send to account: ", ethers.utils.formatEther(tokensAfterPay))
    const provider = waffle.provider;
    const balance = await provider.getBalance(owner);
    const allSaleTokens = await self.crowdsaleContract.allSaleTokens();

    console.log("\t  Balance owner is ", balance.toString(), owner)
    console.log("\t  Saled tokens ",ethers.utils.formatEther(allSaleTokens))

    expect(tokensAfterPay.toString()).to.equal(tokensAmount.toString())

}