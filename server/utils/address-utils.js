const { keccak256 } = require("ethereum-cryptography/keccak");

exports.getAddress = function (publicKey) {
	return keccak256(publicKey.slice(1)).slice(-20);
};
