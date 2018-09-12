pragma solidity ^0.4.23;

import "./CarborCoin.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";

contract CarborCrowdsale is CappedCrowdsale, RefundableCrowdsale, MintedCrowdsale, WhitelistedCrowdsale {

    // ICO Stages
    // ==========
    enum Stage { PreSaleBonus20Percent, PreSaleBonus10Percent, PreSaleBonus5Percent, PreSaleBonus2Percent, MainSale }
    struct StageDetail {
        Stage stage;
        uint startTime;
        uint endTime;
        uint rate;
        bool exist;
    }
    mapping(uint => StageDetail) public stages;
    uint public stagesLength;

    // Token distribution
    // ===================
    uint256 public maxTokens = 2000000000000000000000000000; // 200 000 000 tokens
    uint256 public tokensForTeam = 1000000000000000000000000000; // 100 000 000 tokens will be minted and shared between funders, developers, partners, bounties
    uint256 public tokensForPrivateSale = 50000000000000000000000000; // 5 000 000 tokens will be minted for private sale and early investors

    // Constructor
    // ===========
    function CarborCrowdsale(uint256 _startTime, uint256 _endTime, uint _rate, address _wallet, uint256 _cap, uint _goal, CarborCoin _token) public
        Crowdsale(_rate, _wallet, _token)
        TimedCrowdsale(_startTime, _endTime)
        RefundableCrowdsale(_goal)
        CappedCrowdsale(_cap) 
    {
    }

    //Stage management
    // ===============

    // Enable to change the rate
    function setRate(uint _rate) public onlyOwner {
        rate = _rate;
        if (stages[uint(Stage.PreSaleBonus20Percent)].exist) {
            stages[uint(Stage.PreSaleBonus20Percent)].rate = rate.add(rate.mul(20).div(100));
        }
        else if (stages[uint(Stage.PreSaleBonus10Percent)].exist) {
            stages[uint(Stage.PreSaleBonus10Percent)].rate = rate.add(rate.mul(10).div(100));
        }
        else if (stages[uint(Stage.PreSaleBonus5Percent)].exist) {
            stages[uint(Stage.PreSaleBonus5Percent)].rate = rate.add(rate.mul(5).div(100));
        }
        else if (stages[uint(Stage.PreSaleBonus2Percent)].exist) {
            stages[uint(Stage.PreSaleBonus2Percent)].rate = rate.add(rate.mul(2).div(100));
        }
        else if (stages[uint(Stage.MainSale)].exist) {
            stages[uint(Stage.MainSale)].rate = rate;
        }
    }

    //Define sale stage with its time boundaries
    function setStage (uint _stageNumber, uint _startTime, uint _endTime) public onlyOwner {
        // require(_startTime >= block.timestamp);
        require(_startTime >= openingTime, "Start time is lower than the ICO opening time");
        require(_endTime >= _startTime, "End time is lower than start time");
        require(_endTime <= closingTime, "End time is upper than the ICO closing time");

        if (_stageNumber == uint(Stage.PreSaleBonus20Percent) && stages[uint(Stage.PreSaleBonus20Percent)].exist == false) {
            stages[uint(Stage.PreSaleBonus20Percent)] = StageDetail(Stage.PreSaleBonus20Percent, _startTime, _endTime, rate.add(rate.mul(20).div(100)), true);
            stagesLength++;
        }
        else if (_stageNumber == uint(Stage.PreSaleBonus10Percent) && stages[uint(Stage.PreSaleBonus10Percent)].exist == false) {
            stages[uint(Stage.PreSaleBonus10Percent)] = StageDetail(Stage.PreSaleBonus10Percent, _startTime, _endTime, rate.add(rate.mul(10).div(100)), true);
            stagesLength++;
        }
        else if (_stageNumber == uint(Stage.PreSaleBonus5Percent) && stages[uint(Stage.PreSaleBonus5Percent)].exist == false) {
            stages[uint(Stage.PreSaleBonus5Percent)] = StageDetail(Stage.PreSaleBonus5Percent, _startTime, _endTime, rate.add(rate.mul(5).div(100)), true);
            stagesLength++;
        }
        else if (_stageNumber == uint(Stage.PreSaleBonus2Percent) && stages[uint(Stage.PreSaleBonus2Percent)].exist == false) {
            stages[uint(Stage.PreSaleBonus2Percent)] = StageDetail(Stage.PreSaleBonus2Percent, _startTime, _endTime, rate.add(rate.mul(2).div(100)), true);
            stagesLength++;
        }
        else if (_stageNumber == uint(Stage.MainSale) && stages[uint(Stage.MainSale)].exist == false) {
            require(_endTime == closingTime);
            stages[uint(Stage.MainSale)] = StageDetail(Stage.MainSale, _startTime, _endTime, rate, true);
            stagesLength++;
        }
    }

    //Get the current stage for the current date
    function _findCurrentStage(uint _currentTime) internal view returns (StageDetail) {
        if (stages[uint(Stage.PreSaleBonus20Percent)].exist && _currentTime >= stages[uint(Stage.PreSaleBonus20Percent)].startTime && _currentTime <= stages[uint(Stage.PreSaleBonus20Percent)].endTime) {
            return stages[uint(Stage.PreSaleBonus20Percent)];
        }
        else if (stages[uint(Stage.PreSaleBonus10Percent)].exist && _currentTime >= stages[uint(Stage.PreSaleBonus10Percent)].startTime && _currentTime <= stages[uint(Stage.PreSaleBonus10Percent)].endTime) {
            return stages[uint(Stage.PreSaleBonus10Percent)];
        }
        else if (stages[uint(Stage.PreSaleBonus5Percent)].exist && _currentTime >= stages[uint(Stage.PreSaleBonus5Percent)].startTime && _currentTime <= stages[uint(Stage.PreSaleBonus5Percent)].endTime) {
            return stages[uint(Stage.PreSaleBonus5Percent)];
        }
        else if (stages[uint(Stage.PreSaleBonus2Percent)].exist && _currentTime >= stages[uint(Stage.PreSaleBonus2Percent)].startTime && _currentTime <= stages[uint(Stage.PreSaleBonus2Percent)].endTime) {
            return stages[uint(Stage.PreSaleBonus2Percent)];
        }
        else if (stages[uint(Stage.MainSale)].exist && _currentTime >= stages[uint(Stage.MainSale)].startTime && _currentTime <= stages[uint(Stage.MainSale)].endTime) {
            return stages[uint(Stage.MainSale)];
        }
    }

    
    // Get the current stage. Get the stage, the start time, the end time and the rate
    function getCurrentStage (uint _currentTime) public view returns (uint, uint, uint, uint) {
        StageDetail memory _stage = _findCurrentStage(_currentTime);
        if (_stage.exist) {
            return (uint(_stage.stage), _stage.startTime, _stage.endTime, _stage.rate);
        }
        else {
            return (100, 0,0,0);
        }
    }   

    // Token purchase
    // ==============

    // Override 
    // Get the token amount using the current rate
    function _getTokenAmount(uint256 _weiAmount)
        internal view returns (uint256)
    {
        StageDetail memory _stage = _findCurrentStage(now);
        return _weiAmount.mul(_stage.rate);
    }

    //Receive payments
    function () external payable {
        buyTokens(msg.sender);
    }

    // Finish: Mint Extra Tokens as needed before finalizing the Crowdsale.
    // ====================================================================
    function finish(address _teamFund, address _privateSaleFund) public onlyOwner {
        require(!isFinalized);
        uint256 alreadyMinted = token.totalSupply();

        uint unsoldTokens = cap.sub(alreadyMinted);
        if (unsoldTokens > 0) {
            tokensForTeam = tokensForTeam.add(unsoldTokens);
        }

        super._deliverTokens(_teamFund, tokensForTeam);
        super._deliverTokens(_privateSaleFund, tokensForPrivateSale);
        finalize();
    }
}