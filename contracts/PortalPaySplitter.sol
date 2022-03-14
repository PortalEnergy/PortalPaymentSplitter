// SPDX-License-Identifier: MIT

pragma solidity <0.9.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "./PEToken.sol";

contract PortalPaySplitter is OwnableUpgradeable {
    using SafeMathUpgradeable for uint256;

    event PaymentReceived(address from, uint256 amount);
    event Distribute(DistributeProcess amount);

    PEToken _peTokenContract;
    address _contractAddress;

    mapping(address => uint256) _stakers;
    mapping(address => uint256) _stakersdiv;
    mapping(uint256 => address) _stakeAddresses;
    mapping(address => uint256) _balances;

    struct DistributeProcess { // Struct
        uint256 amountForDistribute;
        uint256 amountPerToken;
        uint256 percent;
        uint256 totalCoinsInContract;
        uint256 distributedAmount;
        uint256 lastDistributeidndex;
        bool init;
        bool isTreasureDistribute;
        bool isProcess;
        bool finishDistribute;
    }

    DistributeProcess _distributeProcess;
    uint256 _stakersCount;
    uint256 _totalCoinsInContract;
    uint256 _treasurePercent;
    uint256 _sharePercent;
    uint256 _treasureAmount;
    uint256 _distributeAmount;
    uint256 _minEtherForDistribute;
    uint256 _minStake;
    uint256 _distributedAmout;
    uint8 _maxAccountsPerDistribute;
    uint256 BIGNUMBER;
    
    

    function initialize(address tokenContractAddr) public initializer {

        BIGNUMBER = 10**18;
        _treasurePercent = 20;
        _sharePercent = 80;
        _treasureAmount = 0;
        _distributeAmount = 0;
        _distributedAmout = 0;
        _contractAddress = address(this);
        _totalCoinsInContract = 0;
        _stakersCount = 0;
        _maxAccountsPerDistribute = 100;
        _minEtherForDistribute = 1 ether/ 2;
        _minStake = 200 ether;

        OwnableUpgradeable.__Ownable_init();
        distributeProcessClear();

        _peTokenContract = PEToken(tokenContractAddr);
    }



    receive() external payable virtual {
        _distributeAmount += msg.value;
        emit PaymentReceived(msg.sender, msg.value);
    }

    function getTotalCoinsInContract() public view returns (uint256) {
        return _totalCoinsInContract;
    }

    function getStakersCount() public view returns (uint256) {
        return _stakersCount;
    }

    function getTreasureAmount() public view returns (uint256) {
        return _treasureAmount;
    }

    function getTreasurePercent() public view returns (uint256) {
        return _treasurePercent;
    }
    function getSharePercent() public view returns (uint256) {
        return _sharePercent;
    }

    function getDistributeAmount() public view returns (uint256) {
        return _distributeAmount;
    }

    function getDistributedAmount() public view returns (uint256) {
        return _distributedAmout;
    }

    function getETHBalance(address stakeOwner) public view returns (uint256) {
        return _balances[stakeOwner];
    }

    function getStakeAmountByAddress(address stakeOwner) public view returns (uint256){
        return _stakers[stakeOwner];
    }

    function getMinEtherForDistribute() public view returns (uint256) {
        return _minEtherForDistribute;
    }

    function getMaxAccountsPerDistribute() public view returns (uint8) {
        return _maxAccountsPerDistribute;
    }

    function getMinStake() public view returns(uint256){
        return _minStake;
    }



    function setMaxAccountsPerDistribute(uint8 max) external onlyOwner {
        require(max > 10, "Minimum of 10");
        _maxAccountsPerDistribute = max;
    }

    function setMinStake(uint256 min) external onlyOwner {
        require(min > 10 ether, "Minimum of 10");
        _minStake = min;
    }

    function setMinEtherForDistribute(uint256 min) external onlyOwner {
        require(min > 1 ether / 2, "Minimum of 10");
        _minEtherForDistribute = min;
    }

    function setTreasurePercent(uint256 percent) external onlyOwner {
        // if false then trow
        require(percent <= 50, "Maximum 50%");
        _treasurePercent = percent;
        _sharePercent = uint256(100).sub(percent);
    }

    function isProcessDistribute() public view returns (bool) {
        return _distributeProcess.isProcess;
    }

    function distributeProcessClear() private {
        _distributeProcess = DistributeProcess(0, 0, 0 , 0, 0, 0,false, false, false, false);
    }

    function _distributeInit() private {
        if(_distributeProcess.init == false ){
            _distributeProcess.amountForDistribute = _distributeAmount;
            _distributeProcess.isProcess = true;
            _distributeProcess.percent = _distributeAmount.div(100);
            _distributeProcess.totalCoinsInContract = _totalCoinsInContract.div(BIGNUMBER);

            uint256 shareAmount = _distributeProcess.percent.mul(_sharePercent);

            _distributeProcess.amountPerToken = shareAmount.div(_distributeProcess.totalCoinsInContract);
            _distributeProcess.init = true;
        }
    }

    function distribute() external onlyOwner {
        require(_stakersCount > 0, "Nobody stakes");
        require(_distributeAmount >= _minEtherForDistribute, "Not enough ether for distribute" );

        _distributeInit();
        _shareTreasure();
        _shareStaker();

        if(_distributeProcess.finishDistribute ){
            emit Distribute(_distributeProcess);
            distributeProcessClear();
        }
        
    }

    function _shareTreasure() private {
        if(_distributeProcess.isTreasureDistribute == false ){
            uint256 amount = _distributeProcess.percent.mul(_treasurePercent);
            _treasureAmount += amount;
            _distributedAmout += amount;
            _distributeAmount -= amount;
            _distributeProcess.distributedAmount += amount;
            _distributeProcess.isTreasureDistribute = true;
        }

    }

    function _shareStaker() private {

        uint16 b = 0;

        bool finishDistribute = true;

        if(_distributeProcess.lastDistributeidndex != 0)
            _distributeProcess.lastDistributeidndex++;

        uint256 d = _distributeProcess.lastDistributeidndex;

        for (uint256 i = d; i < _stakersCount; i++) {
            address addr = _stakeAddresses[i];
            uint256 coinsOfStaker = _stakersdiv[addr];
            uint256 stakerShare = _distributeProcess.amountPerToken.mul(coinsOfStaker);

            _balances[addr] += stakerShare;
            _distributeProcess.distributedAmount += stakerShare;
            _distributeAmount -= stakerShare;
            _distributedAmout += stakerShare;
            d = i;

            if (b == _maxAccountsPerDistribute) {
                b++;
                finishDistribute = false;
                break;
            }

            b++;
           
        }
        
        _distributeProcess.lastDistributeidndex = d;
    
        _distributeProcess.finishDistribute = finishDistribute; 
    }

    function stake(uint256 amount) external {
        address sender = msg.sender;
        uint256 senderTokenBalance = _peTokenContract.balanceOf(sender);
        
        require(amount >= _minStake, "Not enough minimum tokens for stake" );
        require(senderTokenBalance >= amount, "Not enough tokens on your account");
        require(!_distributeProcess.isProcess, "Try later");

        uint256 allowanceByUser = _peTokenContract.allowance(
            sender,
            this.owner()
        ); 

        require(
            allowanceByUser < amount,
            "Allowance of tokens is not enough for staking! Please approve transaction."
        );

        _peTokenContract.transferFrom(sender, _contractAddress, amount);

        uint256 stakesBefore = _stakers[sender];

        if (stakesBefore <= 0) {
            _stakeAddresses[_stakersCount] = sender;
            _stakersCount++;
        }

        _stakersdiv[sender] += amount.div(BIGNUMBER);
        _stakers[sender] += amount;
        _totalCoinsInContract += amount;
    }



    function releaseStake() external {
        require(!_distributeProcess.isProcess, "Try later");

        address sender = msg.sender;
        uint256 amount = _stakers[sender];

        require(amount > 0, "Nothig to release");

        _peTokenContract.transfer(sender, amount);
        _totalCoinsInContract -= amount;
        _stakers[sender] = 0;
        _stakersCount--;
    }

    function releaseETH() external {
        require(!_distributeProcess.isProcess, "Try later");

        address sender = msg.sender;
        uint256 amount = _balances[sender];

        require(amount > 0, "Nothig to release");

        require(
            _contractAddress.balance >= amount,
            "Address: insufficient balance"
        );

        (bool success, ) = sender.call{value: amount}("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
        _balances[sender] = 0;
    }

}
