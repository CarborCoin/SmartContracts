//solium-disable linebreak-style
//solium-disable max-len

pragma solidity ^0.4.23;

import "./CarborCoin.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "zeppelin-solidity/contracts/crowdsale/validation/WhitelistedCrowdsale.sol";

contract CarborCrowdsale is CappedCrowdsale, RefundableCrowdsale, MintedCrowdsale, WhitelistedCrowdsale {

    // ICO Stages
    // ==========
    enum Stage { PreSaleBonus20Percent, PreSaleBonus10Percent, PreSaleBonus5Percent, MainSale }
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
    uint256 public tokensForTeam = maxTokens.div(2); // 100 000 000 tokens will be minted and shared between funders, developers, partners, bounties
    uint256 public tokensForPrivateSale = 50000000000000000000000000; // 5 000 000 tokens will be minted for private sale and early investors
    uint256 public maxSaleTokens = maxTokens.sub(tokensForTeam).sub(tokensForPrivateSale); // 95 000 000 tokens are available for the sale
    uint256 public softCap = 2000000000000000000000000; //2 000 000 tokens are the soft cap when tokens will be refunded it the ICO does not reach this value
    uint public limitPreSale  = 30000000000000000000000000; //Limit tokens for the presale => 30 000 000 tokens


    // Constructor
    // ===========
    function CarborCrowdsale(uint256 _startTime, uint256 _endTime, uint _rate, address _wallet, CarborCoin _token) public
        Crowdsale(_rate, _wallet, _token)
        TimedCrowdsale(_startTime, _endTime)
        RefundableCrowdsale(softCap)
        CappedCrowdsale(maxSaleTokens) 
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
        else if (stages[uint(Stage.MainSale)].exist) {
            stages[uint(Stage.MainSale)].rate = rate;
        }
    }

    //Define sale stage with its time boundaries
    function setStage (uint _stageNumber, uint _startTime, uint _endTime) public onlyOwner {
        // require(_startTime >= block.timestamp, "Start time must be in the future");
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
        else if (_stageNumber == uint(Stage.MainSale) && stages[uint(Stage.MainSale)].exist == false) {
            require(_endTime == closingTime, "Main stage end time must be the same as the crowdsale endtime");
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
        else if (stages[uint(Stage.MainSale)].exist && _currentTime >= stages[uint(Stage.MainSale)].startTime && _currentTime <= stages[uint(Stage.MainSale)].endTime) {
            return stages[uint(Stage.MainSale)];
        }
    }

    function _isOnPreSale(uint _currentTime) internal view returns (bool) {

        StageDetail memory stage1 = stages[uint(Stage.PreSaleBonus20Percent)];
        StageDetail memory stage2 = stages[uint(Stage.PreSaleBonus10Percent)];
        StageDetail memory stage3 = stages[uint(Stage.PreSaleBonus5Percent)];

        if (stage1.exist && _currentTime >= stage1.startTime && _currentTime <= stage1.endTime) {
            return true;
        }
        else if (stage2.exist && _currentTime >= stage2.startTime && _currentTime <= stage2.endTime) {
            return true;
        }
        else if (stage3.exist && _currentTime >= stage3.startTime && _currentTime <= stage3.endTime) {
            return true;
        }
        else {
            return false;
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
        if (_isOnPreSale(now)) {
            require(_getTokenAmount(msg.value) < limitPreSale, "Cannot buy more tokens than the presale limit");
            require(token.totalSupply() < limitPreSale, "Cannot buy more tokens than the presale limit");
            buyTokens(msg.sender);
        }
        else {
            buyTokens(msg.sender);
        }
    }

    // Finish: Mint Extra Tokens as needed before finalizing the Crowdsale.
    // ====================================================================
    function finish(address _teamFund, address _privateSaleFund) public onlyOwner {
        require(_teamFund != address(0), "Team fund address is not valid");
        require(_privateSaleFund != address(0), "Private sale fund address is not valid");
        require(hasClosed(), "Cannot proceed to finalize and release token before the end of the crowdsale");
        require(!isFinalized, "Cannot proceed finalization two times");
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