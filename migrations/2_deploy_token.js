var CarborCoin = artifacts.require("./CarborCoin.sol");

module.exports = function(deployer, network, accounts) {
  return deployer.deploy(CarborCoin);
};
