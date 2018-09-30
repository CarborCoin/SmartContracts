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

module.exports = async (deployer, network, accounts) => {

  return deployer.then(async () => {
    const token = await CarborCoin.deployed()
    console.log("Token contract: ", token.address)
  
    const blockNumber = await getBlockNumber()
    const latestBlock = await getBlock(blockNumber)
  
    const latestTime = new Date((latestBlock.timestamp + 120) * 1000)
  
    const startTime = Math.round(new Date(latestTime.getTime()).getTime() / 1000)
    const endTime = Math.round(new Date(new Date().setDate(latestTime.getDate() + 100)).getTime() / 1000)
  
    const rate = 500 //0.002 ETH buy 1 CBOR && 1 ETH buy 500 CBOR
  
    const crowdsale = await deployer.deploy(CarborCrowdsale, 
      startTime,
      endTime,
      rate,
      accounts[0], //beneficiary address
      token.address)
  
    await token.transferOwnership(crowdsale.address)
  
    //10 days by stage until the final stage
  
    const startTimeStage1 = startTime
    const endTimeStage1 = Math.round(new Date(new Date().setDate(latestTime.getDate() + 10)).getTime() / 1000)
  
    const startTimeStage2 = Math.round(new Date(new Date().setDate(latestTime.getDate() + 11)).getTime() / 1000)
    const endTimeStage2 = Math.round(new Date(new Date().setDate(latestTime.getDate() + 21)).getTime() / 1000)
  
    const startTimeStage3 = Math.round(new Date(new Date().setDate(latestTime.getDate() + 22)).getTime() / 1000)
    const endTimeStage3 = Math.round(new Date(new Date().setDate(latestTime.getDate() + 32)).getTime() / 1000)
  
    const startTimeStage5= Math.round(new Date(new Date().setDate(latestTime.getDate() + 44)).getTime() / 1000)
    const endTimeStage5 = endTime
  
    await crowdsale.setStage(0, startTimeStage1, endTimeStage1) //Stage1 => 20% bonus
    await crowdsale.setStage(1, startTimeStage2, endTimeStage2) // Stage2 => 10% bonus
    await crowdsale.setStage(2, startTimeStage3, endTimeStage3) // Stage3 => 5% bonus
    await crowdsale.setStage(3, startTimeStage5, endTimeStage5) // Main Stage => rate (500)
  
    console.log("Crowdsale contract: ", crowdsale.address)
  })
};
