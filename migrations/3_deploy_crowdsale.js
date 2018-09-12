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


};
