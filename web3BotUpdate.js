import { ethers } from 'ethers'

let sucess = false
const privateKeys = "0xPrivatekey"
const rpc = "https://ethereum-goerli.publicnode.com"
const provider = new ethers.JsonRpcProvider(rpc);
const _signer = new ethers.Wallet(privateKeys);
const signer = _signer.connect(provider);
const addressTarget = "0xtargetAddress"
const tokenContract = "0xTokenContract"
const data = ""
const claimContract = ""
const abi = [{
	"inputs": [{
		"internalType": "address",
		"name": "recipient",
		"type": "address"
	}, {
		"internalType": "uint256",
		"name": "amount",
		"type": "uint256"
	}],
	"name": "transfer",
	"outputs": [{
		"internalType": "bool",
		"name": "",
		"type": "bool"
	}],
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"inputs": [{
		"internalType": "address",
		"name": "recipient",
		"type": "address"
	}],
	"name": "balanceOf",
	"outputs": [{
		"internalType": "uint256",
		"name": "",
		"type": "uint256"
	}],
	"stateMutability": "view",
	"type": "function"
}]
async function Claim() {
	try {
		const nonce = await provider.getTransactionCount(signer.address)
		const balance = ethers.formatEther(await provider.getBalance(signer.address))
		const fee = ethers.formatEther((await provider.getFeeData()).gasPrice.toString(), 'gwei')
		const gasLimit = await provider.estimateGas({
			to: claimContract,
			value: ethers.parseEther("0"),
			data
		})
		const feeTotal = parseFloat(fee) * parseFloat(gasLimit)
		console.log(`Address: ${signer.address}\nBalance: ${balance}\nNonce: ${nonce}`)
		console.log(`FeeTotal: ${feeTotal}\nGasLimit: ${gasLimit}\nFee: ${ethers.formatUnits(ethers.parseEther(fee), 'gwei')} Gwei`)
		if(parseFloat(balance) < feeTotal) {
			console.log(`!WARNING: gas fee tidak cukup\n`)
		} else if(sucess){
			return
		} else {
			const transaction = await signer.sendTransaction({
				to: claimContract,
				value: ethers.parseEther("0"),
				nonce: nonce,
				data,
				gasLimit,
				gasPrice: ethers.parseUnits(fee, "ether")
			})
			if(transaction.hash) {
				console.log(`\n SUCCES: ${transaction.hash} \n`)
				sucess= true
			}
		}
	} catch (err) {
		console.log(err.message)
		return 
	}
}
provider.on('block', async () => {
	//await Claim()
	//if(sucess) {
		
		try {
			const token = new ethers.Contract(tokenContract, abi, signer)
			const nonce = await provider.getTransactionCount(signer.address)
			const tokenBalance = ethers.formatEther(await token.balanceOf(signer.address))
			const balance = ethers.formatEther(await provider.getBalance(signer.address))
			const params = [addressTarget, ethers.parseEther(tokenBalance)]
			const fee = ethers.formatEther((await provider.getFeeData()).gasPrice.toString(), 'gwei')
			console.log(`Address: ${signer.address}\nBalance: ${balance}\nNonce: ${nonce}`)
			const gasLimit = await token.transfer.estimateGas(...params)
			const feeTotal = parseFloat(fee) * parseFloat(gasLimit)
			console.log(`FeeTotal: ${feeTotal.toFixed(10)}\nGasLimit: ${gasLimit}\nFee: ${ethers.formatUnits(ethers.parseEther(fee), 'gwei')} Gwei`)
			if(parseFloat(tokenBalance) == 0) {
				console.log(`token kosong\n`)
			} else if(parseFloat(balance) < feeTotal) {
				console.log(`!WARNING: gas fee tidak cukup\n`)
			} else {
				const transaction = await token.transfer(...params, {
					value: ethers.parseEther("0"),
					nonce: nonce,
					gasLimit,
					gasPrice: ethers.parseUnits(fee, "ether")
				})
				if(transaction.hash) {
					console.log(`\n SUCCES: ${transaction.hash} \n`)
				}
			}
		} catch (err) {
			console.log(err.message)
		}
	//}
})