var SafeMath = artifacts.require("./SafeMath.sol");
var OnyxToken = artifacts.require("./OnyxToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SafeMath);
  deployer.link(SafeMath, OnyxToken);
  deployer.deploy(OnyxToken, 20, 20, 100, 1, 10);
};
