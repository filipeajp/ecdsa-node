import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance }) {
	const [sendAmount, setSendAmount] = useState("");
	const [recipient, setRecipient] = useState("");

	const setValue = (setter) => (evt) => setter(evt.target.value);

	async function transfer(evt) {
		evt.preventDefault();

		// TODO add private key secret through environment variable
		const transaction = {
			timestamp: Date.now(),
			sender: address,
			amount: parseInt(sendAmount),
			recipient,
		};

		const [sig, recoveryBit] = await secp.sign(
			keccak256(utf8ToBytes(JSON.stringify(transaction))),
			"32dfcaa3e78efef2000ad64dc8ac45eacb685df7ee8f11961525d98bf176fa40",
			{ recovered: true }
		);

		try {
			const {
				data: { balance },
			} = await server.post(`send`, {
				transaction: transaction,
				signature: {
					sig: sig,
					recoveryBit: recoveryBit,
				},
			});
			setBalance(balance);
		} catch (ex) {
			alert(ex.response.data.message);
		}
	}

	return (
		<form className="container transfer" onSubmit={transfer}>
			<h1>Send Transaction</h1>

			<label>
				Send Amount
				<input
					placeholder="1, 2, 3..."
					value={sendAmount}
					onChange={setValue(setSendAmount)}></input>
			</label>

			<label>
				Recipient
				<input
					placeholder="Type an address, for example: 0x2"
					value={recipient}
					onChange={setValue(setRecipient)}></input>
			</label>

			<input type="submit" className="button" value="Transfer" />
		</form>
	);
}

export default Transfer;
