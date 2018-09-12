
var BigNumber = require('bignumber.js');

var CarborCrowdsale = artifacts.require("CarborCrowdsale");
var CarborCoin = artifacts.require("CarborCoin");

contract ('CarborCrowdsale', async (accounts) => {

    let token = null;
    let crowdsale = null;
    let mainStartTime = null;
    let mainEndTime = null;

    beforeEach(async () => {

        //TEST VALUES
        mainStartTime = Math.round(new Date(new Date().setDate(new Date().getDate())).getTime() / 1000); //Started 20 days before
        mainEndTime = Math.round(new Date(new Date().setDate(new Date().getDate() + 20)).getTime() / 1000); //Finish in 20 days
        const rate = 500; //0.002 ETH buy 1 CBOR && 1 ETH buy 500 CBOR

        token = await CarborCoin.new()
        crowdsale = await CarborCrowdsale.new(mainStartTime, 
            mainEndTime,
            rate,
            accounts[0], //beneficiary address
            web3.toWei(95000000 / rate, 'ether'), // Cap is 95 000 000 tokens
            web3.toWei(2000000 / rate, 'ether'), // Goal is 2 000 000 tokens
            token.address
        )

        await token.transferOwnership(crowdsale.address)
    });

    it ('Should deploy the token and store the address', async () => {
        const _token = await crowdsale.token.call();
        assert(_token, 'Token address could not be stored');
        assert(_token == token.address, 'Token address stored is not the same')
    });

    it ('Should set the stage', async () => {
        const startTime = mainStartTime;
        const endTime = mainStartTime + 120;

        await crowdsale.setStage(1, startTime, endTime) //Stage 2 => 10% bonus
        const stagesLength = await crowdsale.stagesLength();
        assert.equal(1, stagesLength.toString(10), 'There are no stages on the contract');
        const stage2 = await crowdsale.stages(1);

        assert.equal(stage2[0].toString(10), 1, "Stage is not PreSaleBonus10Percent")
        assert.equal(stage2[1].toString(10), startTime, "Start time is not yesterday")
        assert.equal(stage2[2].toString(10), endTime, "End time is not tomorrow")
        assert.equal(stage2[3].toString(10), 550, "Rate is not 600: 500 * 10%")
        assert.equal(stage2[4], true, "Stage does not flagged as exist")

        const currentStage = await crowdsale.getCurrentStage(Math.round(new Date().getTime() / 1000));
        assert.equal(currentStage[0].toString(10), 1, 'Current stage is not PreSaleBonus10Percent');
        assert.equal(currentStage[3].toString(10), 550, 'Current stage does not have a rate of 550');
    })

    it ('Should add whitelist investor', async () => {
        await crowdsale.addAddressToWhitelist(accounts[7]);
        const isWhitelisted = await crowdsale.whitelist(accounts[7]);
        assert.equal(isWhitelisted, true, "Address is not whitelisted");
    })

    it ('Should buy tokens and get 20% more on stage 1', async () => {
        const startTime = mainStartTime;
        const endTime = mainStartTime + 120;

        await crowdsale.setStage(0, startTime, endTime) //Stage1 => 20% bonus

        await crowdsale.addAddressToWhitelist(accounts[7]);

        await crowdsale.sendTransaction({ from: accounts[7], value: web3.toWei(1, 'ether') });

        const expectedTokens = 600000000000000000000;

        const totalSupply = await token.totalSupply();
        assert.equal(totalSupply.toString(10), expectedTokens, 'Total supply is not equal to 600 tokens')
        const tokensAmount = await token.balanceOf(accounts[7]);
        assert.equal(tokensAmount.toString(10), expectedTokens, 'The sender did not receive the 600 tokens');
    })

    it ('Should buy tokens and get 10% more on stage 2', async() => {
        const startTime = mainStartTime;
        const endTime = mainStartTime + 120;

        await crowdsale.setStage(1, startTime, endTime) //Stage1 => 10% bonus

        await crowdsale.addAddressToWhitelist(accounts[7]);
        await crowdsale.sendTransaction({ from: accounts[7], value: web3.toWei(1, 'ether') });
        const totalSupply = await token.totalSupply();

        const expectedTokens = 550000000000000000000;

        assert.equal(totalSupply.toString(10), expectedTokens, 'Total supply is not equal to 550 tokens')
        const tokensAmount = await token.balanceOf(accounts[7]);
        assert.equal(tokensAmount.toString(10), expectedTokens, 'The sender did not receive the 550 tokens');

    })

    it ('Should buy tokens and get 5% more on stage 3', async() => {
        const startTime = mainStartTime;
        const endTime = mainStartTime + 120;

        await crowdsale.setStage(2, startTime, endTime) //Stage2 => 5% bonus

        await crowdsale.addAddressToWhitelist(accounts[7]);
        await crowdsale.sendTransaction({ from: accounts[7], value: web3.toWei(1, 'ether') });
        const totalSupply = await token.totalSupply();

        const expectedTokens = 525000000000000000000;

        assert.equal(totalSupply.toString(10), expectedTokens, 'Total supply is not equal to 525 tokens')
        const tokensAmount = await token.balanceOf(accounts[7]);
        assert.equal(tokensAmount.toString(10), expectedTokens, 'The sender did not receive the 525 tokens');
    })

    it ('Should buy tokens and get 2% more on stage 4', async() => {
        const startTime = mainStartTime;
        const endTime = mainStartTime + 120;

        await crowdsale.setStage(3, startTime, endTime) //Stage3 => 2% bonus

        await crowdsale.addAddressToWhitelist(accounts[7]);
        await crowdsale.sendTransaction({ from: accounts[7], value: web3.toWei(1, 'ether') });
        const totalSupply = await token.totalSupply();

        const expectedTokens = 510000000000000000000;

        assert.equal(totalSupply.toString(10), expectedTokens, 'Total supply is not equal to 510 tokens')
        const tokensAmount = await token.balanceOf(accounts[7]);
        assert.equal(tokensAmount.toString(10), expectedTokens, 'The sender did not receive the 510 tokens');
    })

    it ('Should buy tokens on main sale', async() => {
        await crowdsale.setStage(4, mainStartTime, mainEndTime) //Stage4 => Main sale

        await crowdsale.addAddressToWhitelist(accounts[7]);
        await crowdsale.sendTransaction({ from: accounts[7], value: web3.toWei(1, 'ether') });
        const totalSupply = await token.totalSupply();

        const expectedTokens = 500000000000000000000;

        assert.equal(totalSupply.toString(10), expectedTokens, 'Total supply is not equal to 500 tokens')
        const tokensAmount = await token.balanceOf(accounts[7]);
        assert.equal(tokensAmount.toString(10), expectedTokens, 'The sender did not receive the 500 tokens');
    })

    it ('Should change the rate', async () => {
        await crowdsale.setStage(0, mainStartTime, mainEndTime);
        let currentStage = await crowdsale.getCurrentStage(Math.round(new Date().getTime() / 1000))
        assert.equal(currentStage[3].toString(10), 600, "Current rate must be 600"); // 500 + 20% bonus

        await crowdsale.setRate(700);
        currentStage = await crowdsale.getCurrentStage(Math.round(new Date().getTime() / 1000))
        assert.equal(currentStage[3].toString(10), 840, "Current rate must be 840"); // 700 + 20% bonus

        await crowdsale.addAddressToWhitelist(accounts[7]);
        await crowdsale.sendTransaction({ from: accounts[7], value: web3.toWei(1, 'ether') });

        const totalSupply = await token.totalSupply();

        const expectedTokens = 840000000000000000000;

        assert.equal(totalSupply.toString(10), expectedTokens, 'Total supply is not equal to 840 tokens')
        const tokensAmount = await token.balanceOf(accounts[7]);
        assert.equal(tokensAmount.toString(10), expectedTokens, 'The sender did not receive the 840 tokens');
    })

    // TO TEST, comment line 133 on CarborCrowdsale.sol
    // it ('Should finalize the crowdsale', async () => {
    //     await crowdsale.setStage(4, mainStartTime, mainEndTime);
    //     await crowdsale.addToWhitelist(accounts[2]);
    //     await crowdsale.sendTransaction({ from: accounts[2], value: web3.toWei(10, 'ether') });

    //     const tokensAmount = await token.balanceOf(accounts[2]);
    //     assert.equal(tokensAmount.toString(10), 5000000000000000000000, 'The sender did not receive the 5 000 tokens');

    //     await crowdsale.finish(accounts[3], accounts[4]);
    //     const teamTokenAmount = await token.balanceOf(accounts[3]);
    //     const privateSaleTokenAmount = await token.balanceOf(accounts[4]);

    //     const unsoldTokens = 47499995000000000000000000000; // 95 000 000(cap) - 5 000(sold) tokens
    //     const teamTokensReserved = 1000000000000000000000000000; // 100 000 000 tokens
    //     const privateSaleTokenReserved = 50000000000000000000000000; // 5 000 000 tokens

    //     assert.equal(privateSaleTokenAmount.toString(10), privateSaleTokenReserved, "Private sale address did not receive 5 000 000 tokens")

    //     const totalSupply = await token.totalSupply()
    //     assert.equal(totalSupply.toString(10), new BigNumber(tokensAmount).plus(teamTokenAmount).plus(privateSaleTokenReserved).toString(10), "Total supply is not of 48550000000000000000000000000 tokens");
    //     assert.equal(privateSaleTokenAmount.toString(10), privateSaleTokenReserved, "Private sale address did not receive 5 000 000 tokens")
    //     assert.equal(teamTokenAmount.toString(10), new BigNumber(teamTokensReserved).plus(unsoldTokens).toString(10) , "Team address did not receive 48 499 995 000 tokens");
    // })
 

});