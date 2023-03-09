import express from 'express'
import dotenv from 'dotenv'
import Web3 from 'web3'
import path from 'path'
import fs from 'fs'
import solc from 'solc'

import { authArea } from '../middleware/auth.middleware.js'

const smartContractPath = path.resolve(__dirname, 'PawPaw.sol')
const smartContractSol = fs.readFileSync(helloPath, 'UTF-8')

dotenv.config({ path: './.env' })
const router = express.Router()

// ----------------------------------------------------------------------
// Implementation of ROUTES
// ----------------------------------------------------------------------

const getContractAddress = async (fileName) => {
  const input = {
    language: 'Solidity',
    sources: {
      fileName: {
        content: smartContractSol,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
    },
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input)))
  const contract = output.contracts[fileName]['Token']
  const abi = contract.abi
  const bytecode = contract.evm.bytecode.object

  return {
    output: output,
    contract: contract,
    abi: abi,
    bytecode: bytecode,
  }
}

const _compileSmartContract = async (req, res) => {
  const { abi, bytecode } = getContractAddress('sol/PawPaw.sol')

  const web3 = new Web3(process.env.ETH_NODE)
  const accounts = await web3.eth.getAccounts()
  const contractInstance = new web3.eth.Contract(abi)
  const contractDeployed = await contractInstance
    .deploy({
      data: bytecode,
    })
    .send({
      from: accounts[0],
      gas: 1500000,
      gasPrice: '30000000000000',
    })

  console.log(contractDeployed.options.address)
  res.status(201).send({ contractDeployed })
}

// create erc20 token for payment
const _requestNewPayment = async (req, res, next) => {
  try {
    const { amount, orderId, token } = req.body
    const { address, privateKey } = req.user
    const { erc20ContractAddress, erc20ContractAbi } = process.env

    const web3 = new Web3(process.env.ETH_NODE)

    const erc20Contract = new web3.eth.Contract(
      JSON.parse(erc20ContractAbi),
      erc20ContractAddress,
    )

    const gasPrice = await web3.eth.getGasPrice()
    const gasLimit = await erc20Contract.methods
      .transfer(address, amount)
      .estimateGas({ from: address })

    const tx = {
      from: address,
      to: erc20ContractAddress,
      gas: gasLimit,
      gasPrice: gasPrice,
      data: erc20Contract.methods.transfer(address, amount).encodeABI(),
    }

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)

    web3.eth
      .sendSignedTransaction(signedTx.rawTransaction)
      .on('receipt', async (receipt) => {
        console.log(receipt)
        res.status(201).send({ receipt })
      })
      .on('error', (error) => {
        console.log(error)
        res.status(400).send({ error })
      })
  } catch (err) {
    next(err)
  }
}

// ----------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------

router.post('/token', authArea, _requestNewPayment)
router.get('/token', _compileSmartContract)

export default router
