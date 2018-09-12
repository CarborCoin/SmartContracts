var CarborCoin = artifacts.require("./CarborCoin.sol");
var CarborCrowdsale = artifacts.require("./CarborCrowdsale.sol");

const getBlockNumber = () => {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((err, blockNumber) => {
      if (err) return reject(err)
      resolve(blockNumber)
    })
  })
}

const getBlock = (number) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBlock(number, (err, block) => {
      if (err) return reject(err)
      resolve(block)
    })
  })
}

module.exports = function(deployer, network, accounts) {
  CarborCoin.deployed().then(token => {

     getBlockNumber().then(blockNumber => {
       getBlock(blockNumber).then(latestBlock => {
        const latestTime = new Date((latestBlock.timestamp + 120) * 1000)
  
        // const startTime = Math.round(new Date("07/20/2018").getTime() / 1000)
        // const endTime = Math.round(new Date("11/27/2018").getTime() / 1000)
      
        const startTime = Math.round(new Date(latestTime.getTime()).getTime() / 1000)
        const endTime = Math.round(new Date(new Date().setDate(latestTime.getDate() + 10)).getTime() / 1000)
      
        const rate = 500 //0.002 ETH buy 1 CBOR && 1 ETH buy 500 CBOR
      
        return  deployer.deploy(CarborCrowdsale, 
          startTime,
          endTime,
          rate,
          accounts[0], //beneficiary address
          web3.toWei(95000000 * rate, 'ether'), // Cap is 95 000 000 tokens
          web3.toWei(2000000 * rate, 'ether'), // Goal is 2 000 000 tokens
          token.address
        )
       })
     })
  
    
  })


  // await token.transferOwnership(crowdsale.address)

  // // const startTimeStage1  = Math.round(new Date("09/11/2018").getTime() / 1000)
  // // const endTimeStage1  = Math.round(new Date("09/20/2018").getTime() / 1000)
  // // const startTimeStage2  = Math.round(new Date("09/21/2018").getTime() / 1000)
  // // const endTimeStage2  = Math.round(new Date("09/30/2018").getTime() / 1000)
  // // const startTimeStage3  = Math.round(new Date("10/01/2018").getTime() / 1000)
  // // const endTimeStage3  = Math.round(new Date("10/15/2018").getTime() / 1000)
  // // const startTimeStage4  = Math.round(new Date("10/16/2018").getTime() / 1000)
  // // const endTimeStage4  = Math.round(new Date("10/27/2018").getTime() / 1000)
  // // const startTimeStage5  = Math.round(new Date("10/28/2018").getTime() / 1000)
  // // const endTimeStage5  = Math.round(new Date("11/27/2018").getTime() / 1000)

  // const startTimeStage1  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 1)).getTime() / 1000)
  // const endTimeStage1  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 2)).getTime() / 1000)
  // const startTimeStage2  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 3)).getTime() / 1000)
  // const endTimeStage2  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 4)).getTime() / 1000)
  // const startTimeStage3  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 5)).getTime() / 1000)
  // const endTimeStage3  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 6)).getTime() / 1000)
  // const startTimeStage4  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 7)).getTime() / 1000)
  // const endTimeStage4  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 8)).getTime() / 1000)
  // const startTimeStage5  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 9)).getTime() / 1000)
  // const endTimeStage5  = Math.round(new Date(new Date().setDate(latestTime.getDate() + 10)).getTime() / 1000)

  // await crowdsale.setStage(0, startTimeStage1, endTimeStage1) //Stage1 => 20% bonus
  // await crowdsale.setStage(1, startTimeStage2, endTimeStage2) // Stage2 => 10% bonus
  // await crowdsale.setStage(2, startTimeStage3, endTimeStage3) // Stage3 => 5% bonus
  // await crowdsale.setStage(3, startTimeStage4, endTimeStage4) // Stage4 => 2% bonus
  // await crowdsale.setStage(4, startTimeStage5, endTimeStage5) // Main Stage => rate (500)

};
