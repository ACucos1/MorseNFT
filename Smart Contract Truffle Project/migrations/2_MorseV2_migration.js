const MorseV2 = artifacts.require("MorseV2");

module.exports = function (deployer) {
  deployer.deploy(MorseV2, "Morse", "MORSE", "", "");
};
