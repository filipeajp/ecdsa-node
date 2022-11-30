const express = require("express");
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

const { getAddress } = require("./utils/address-utils");

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

// TODO: improve initial data fetching
const balances = {
	"1c9c4ca18c8949238788541628351dc3e43aa42a": 100,
	c371fbc0c34f79a3eb9c6e9ed87e8781a28e31d6: 50,
	"1617fc469f6816cf94cc82969bad47e09d5d84e5": 75,
};

app.get("/balance/:address", (req, res) => {
	const { address } = req.params;
	const balance = balances[address] || 0;
	res.send({ balance });
});

app.post("/send", async (req, res) => {
	const { transaction, signature } = req.body;
	const { sender, recipient, amount } = transaction;
	const { sig, recoveryBit } = signature;

	const publicKey = await secp.recoverPublicKey(
		keccak256(utf8ToBytes(JSON.stringify(transaction))),
		Uint8Array.from(Object.values(sig)),
		recoveryBit
	);
	const address = getAddress(publicKey);

	if (toHex(address) !== sender) {
		const message = "You cannot move funds from this address!";
		res.status(403).send({ message: message });
	}

	setInitialBalance(sender);
	setInitialBalance(recipient);

	if (balances[sender] < amount) {
		res.status(400).send({ message: "Not enough funds!" });
	} else {
		balances[sender] -= amount;
		balances[recipient] += amount;
		res.send({ balance: balances[sender] });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
	if (!balances[address]) {
		balances[address] = 0;
	}
}
