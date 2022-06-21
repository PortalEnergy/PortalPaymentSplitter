const { expect, assert }   =   require('chai');
const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");
const maxTokenSend = 300;
const minTokenSend = 200;
const ethForDistribute = 4;
const showMoreLogs = true;
var owner = null;
var accounts = null;
const holderAccounts = readHolderAccounts();
const holderAccountsSum = sumAmountHolders(holderAccounts);

function randomInterval() { 
    return (Math.random() * (maxTokenSend - minTokenSend + 1) + minTokenSend).toFixed(18);
}

before(async function() {

    accounts = await ethers.getSigners();

    owner = accounts[0].address;

    const PEToken = await ethers.getContractFactory("PEToken");
    const PortalPaySplitter = await ethers.getContractFactory("PortalPaySplitter");

    console.log("Deploying PEToken...");
    const PETokenDeploy = await upgrades.deployProxy(PEToken, ["PEToken", "POE", holderAccountsSum]);
    this.tokenContract = await PETokenDeploy.deployed()
    console.log("PEToken deployed to:", PETokenDeploy.address);

    console.log("Deploying PortalPaySplitter...");
    const migrateData = holdersToArray(holderAccounts)
    const PortalPaySplitterDeploy = await upgrades.deployProxy(PortalPaySplitter, [PETokenDeploy.address, migrateData.accounts, migrateData.balances]);
    this.paymentSplitter  = await PortalPaySplitterDeploy.deployed();

    console.log("PortalPaySplitter deployed to:", PortalPaySplitterDeploy.address);
    console.log("=========================")

    let transfer  = await this.tokenContract.transfer(PortalPaySplitterDeploy.address, ethers.utils.parseEther( holderAccountsSum.toString()), { from: accounts[0].address });
    await transfer.wait();
  
})


describe("Check paymentSplitter", function(){

    it("Is contract works", function() { 

        if(!this.paymentSplitter){
            this.paymentSplitter = null;
        }
        expect(this.paymentSplitter).to.not.be.null;

    });

    it("Is owner correct", async function() { 
        const contractOwner = await this.paymentSplitter.owner();
        expect(contractOwner).to.equal(owner);
    });

    it("getStakersCount()", async function(){
        const count = await this.paymentSplitter.getStakersCount();
        expect(count).to.equal(50);
    })

    it("getTreasureAmount()", async function(){
        const amount = await this.paymentSplitter.getTreasureAmount();
        expect(amount).to.equal(0);
    })


    it("getDistributeAmount()", async function(){
        const amount = await this.paymentSplitter.getDistributeAmount();
        expect(amount).to.equal(0);
    })
    
    it("getTreasurePercent() && setTreasurePercent() && getSharePercent()", async function(){
        const treasurePercent = await this.paymentSplitter.getTreasurePercent();
        expect(treasurePercent).to.equal(20);

        const sharePercent = await this.paymentSplitter.getSharePercent();
        expect(sharePercent).to.equal(80);

        const tx = await this.paymentSplitter.setTreasurePercent(30);
        tx.wait();

        const treasurePercentAfter = await this.paymentSplitter.getTreasurePercent();
        expect(treasurePercentAfter).to.equal(30);

        const sharePercentAfter = await this.paymentSplitter.getSharePercent();
        expect(sharePercentAfter).to.equal(70);

    })


    it("setMaxAccountsPerDistribute and getMaxAccountsPerDistribute", async function(){
        const maxAccountsPerDistribute = await this.paymentSplitter.getMaxAccountsPerDistribute();
        expect(maxAccountsPerDistribute).to.equal(100);

        const tx = await this.paymentSplitter.setMaxAccountsPerDistribute(150);
        tx.wait();

        const maxAccountsPerDistributeAfterChange = await this.paymentSplitter.getMaxAccountsPerDistribute();
        expect(maxAccountsPerDistributeAfterChange).to.equal(150);
    })

    it("setMinEtherForDistribute and getMinEtherForDistribute", async function(){
        const minEtherForDistribute = await this.paymentSplitter.getMinEtherForDistribute();
        
        expect(minEtherForDistribute.toString()).to.equal(ethers.utils.parseEther("0.5").toString());

        const tx = await this.paymentSplitter.setMinEtherForDistribute(ethers.utils.parseEther("1"));
        tx.wait();

        const minEtherForDistributeAfterChange = await this.paymentSplitter.getMinEtherForDistribute();
        expect(minEtherForDistributeAfterChange.toString()).to.equal(ethers.utils.parseEther("1").toString());
    })

    it("setMinStake and getMinStake", async function(){
        const minStake = await this.paymentSplitter.getMinStake();
        
        expect(minStake.toString()).to.equal(ethers.utils.parseEther("200").toString());

        const tx = await this.paymentSplitter.setMinStake(ethers.utils.parseEther("100"));
        tx.wait();

        const minStakeAfterChange = await this.paymentSplitter.getMinStake();
        expect(minStakeAfterChange.toString()).to.equal(ethers.utils.parseEther("100").toString());
    })

})



describe("Send POE Tokens to accounts", function () {
/* 
    it("Is balance correct ", async function() {
        const expectedOwnerPeTokenBalance = "2598700000000000000000";
        const bnActualBalance = await this.tokenContract.balanceOf(owner);
        expect(bnActualBalance.toString()).to.equal(expectedOwnerPeTokenBalance);
    });
     */

/*     it("Send tokens to users", async function() {
        
        const accounts = await ethers.getSigners();
        const owner = accounts[0].address;

        for (let index = 1; index < accounts.length; index++) {
            const anotherUser = accounts[index].address;
            const amount = randomInterval();
            const transactionTokensAmount =  ethers.utils.parseEther(amount);
            if(showMoreLogs) console.log("Transaction is correct account index is "+index+",  send amount "+ethers.utils.formatEther(transactionTokensAmount))

            let tx = await this.tokenContract.transfer(anotherUser, transactionTokensAmount, { from: owner });

            await tx.wait()

            const anotherBalanceAfterTransaction = await this.tokenContract.balanceOf(anotherUser);
            expect(anotherBalanceAfterTransaction.toString()).to.equal(transactionTokensAmount.toString());
        
        }
    }); */

});


/* 
describe("Stake tokens from users to PaymentSplitter", function() {


    it("Check stake() transfer ERC20 from users to contract", async function() {
        for (let index = 1; index < accounts.length; index++) {
            const contractAddress = this.paymentSplitter.address;
            const anotherUser = accounts[index];
            const anotherUserBalance = await this.tokenContract.balanceOf(anotherUser.address);

            // Approve first
            const approve = await this.tokenContract.connect(anotherUser).approve(contractAddress, anotherUserBalance);
            
            await approve.wait();
            // Stake
            const stake = await this.paymentSplitter.connect(anotherUser).stake(anotherUserBalance);

            stake.wait()

            const userStake = await this.paymentSplitter.getStakeAmountByAddress(anotherUser.address);

            expect(userStake.toString()).to.equal(anotherUserBalance.toString());

            const paymentSplitterTokens = await this.paymentSplitter.getStakeAmountByAddress(anotherUser.address);
            
            expect(paymentSplitterTokens.toString()).to.equal(anotherUserBalance.toString());

            if(showMoreLogs) console.log(`Stake from user index ${index} ${ethers.utils.formatEther(paymentSplitterTokens)}`)
        }
    });
    

     it("Should increase stakersCount", async function() {
        const stakersCount = await this.paymentSplitter.getStakersCount();
            
        expect(stakersCount).to.be.equal(accounts.length-1);
     });
});
 */


describe("Manual Stake tokens to PaymentSplitter for users", function() {


    it("Check manual stake() transfer ERC20 from users to contract", async function() {

  

        for (let index = 0; index < holderAccounts.length; index++) {
            const anotherUser = holderAccounts[index];

            //if( index ){
                // Stake
                //const stake = await this.paymentSplitter.addTokensToStake(anotherUser.address, ethers.utils.parseEther(anotherUser.sbBalance.toString()));

                //stake.wait()

            //}

            const paymentSplitterTokens = await this.paymentSplitter.getStakeAmountByAddress(anotherUser.address);
            //console.log("===", paymentSplitterTokens.toString())
            
            expect(paymentSplitterTokens.toString()).to.equal(ethers.utils.parseEther(anotherUser.sbBalance.toString()).toString());

            if(showMoreLogs) console.log(`Stake from user index ${index} ${ethers.utils.formatEther(paymentSplitterTokens)}`)
        }
    });
    

     it("Should increase stakersCount", async function() {
        const stakersCount = await this.paymentSplitter.getStakersCount();

        console.log(` Stakers count ${stakersCount} but in ${holderAccounts.length}`);
            
        expect(stakersCount).to.be.equal(holderAccounts.length);
     });
});



describe("Distribute", function() {
    it("Is contract works", function() { 

        if(!this.paymentSplitter){
            this.paymentSplitter = null;
        }
        expect(this.paymentSplitter).to.not.be.null;

     });

    


    for (let index = 0; index < 3; index++) {
        it(`Send ${ethForDistribute} ETH to PaymentSplitter for distribute`, async function(){
            await accounts[0].sendTransaction(
                {
                    to:this.paymentSplitter.address, 
                    value:ethers.utils.parseEther(ethForDistribute.toString()) 
                }
            );
            const balance = await this.paymentSplitter.getDistributeAmount();
            expect(balance.toString()).not.to.be.equal("0");
        })
    
        
        it(`Distribute ${ethForDistribute} ETH`, async function() {

            for(;;){
                const distribute = await this.paymentSplitter.distribute()
                distribute.wait()

                const isProcessDistribute = await this.paymentSplitter.isProcessDistribute();

                if(!isProcessDistribute) break;
            }   



            let sum = 0;

            for (let index = 0; index < holderAccounts.length; index++) {
                const account = holderAccounts[index];
                const tokens = await this.paymentSplitter.getStakeAmountByAddress(account.address);
                const balance = await this.paymentSplitter.getETHBalance(account.address);
                
                expect(balance).to.not.be.equal(0);

                sum += Number(balance);
                if(showMoreLogs) console.log(`       Balance ${ethers.utils.formatEther(balance)}, tokens ${ethers.utils.formatEther(tokens)} `)
            }

            const stakeAmount = await this.tokenContract.balanceOf(this.paymentSplitter.address);
            const treasureAmount = await this.paymentSplitter.getTreasureAmount();
            const distributeAmount = await this.paymentSplitter.getDistributeAmount();

            console.log(`       Amount of stake: ${ethers.utils.formatEther( stakeAmount )}`)
            console.log(`       Distribute ETH: ${ethers.utils.formatEther( sum.toString() )}`)
            console.log(`       Treasure Amount ETH: ${ethers.utils.formatEther( treasureAmount)}`)
            console.log(`       Undistributed Amount ETH: ${ethers.utils.formatEther( distributeAmount)}`)
            
        })
    }
    
});


/* 
describe("Unstake", function() {

    it(`call releaseStake() fram all accounts`, async function() {
        
        for (let index = 1; index < accounts.length; index++) {
            const account = accounts[index];
            const stakeBeforeRelease = await this.paymentSplitter.getStakeAmountByAddress(account.address);
            const tx = await this.paymentSplitter.connect(account).releaseStake();
            tx.wait();

            const stakeAfterRelease = await this.paymentSplitter.getStakeAmountByAddress(account.address);
            expect(stakeAfterRelease.toString()).to.be.equal("0");

            const balanceOnTokenContract = await this.tokenContract.balanceOf(account.address);

            expect(balanceOnTokenContract.toString()).to.be.equal(stakeBeforeRelease.toString());

        }
        
    })
})


describe("Release ETH", function() {

    it(`call releaseETH() fram all accounts`, async function() {
        
        for (let index = 1; index < accounts.length; index++) {
            const account = accounts[index];
            const tx = await this.paymentSplitter.connect(account).releaseETH();
            tx.wait();

            const ethAfterRelease = await this.paymentSplitter.getETHBalance(account.address);
            
            expect(ethAfterRelease.toString()).to.be.equal("0");

            const balance = await ethers.provider.getBalance(account.address);

            assert.isAbove(  Number(balance.toString()), Number(ethers.utils.parseEther("10000").toString()), "some problem in realise eth")
            
            
            if(showMoreLogs) console.log(`       ETH balance accounts[${index}]: ${ethers.utils.formatEther( balance )} `);

        }
    })
})
 */


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