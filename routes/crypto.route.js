import express from 'express'
import dotenv from 'dotenv'

import { Account } from '../model/Account.model.js'
import { cryptoManager } from '../controller/networks/index.ctrl.js'
import debug from '../utils/logger.js'
import { authArea } from '../middleware/auth.middleware.js'

dotenv.config({ path: './.env' })

const router = express.Router()

const validateNetwork = (network) => {
  const networks = ['ETH', 'ETH_GORLI', 'ETH_SEPOLIA']
  if (
    networks.includes(network.toUpperCase()) ||
    networks.includes(network.toLowerCase())
  )
    return network
  else throw new Error('Invalid network')
}

// get balance
router.get('/balance', async (req, res, next) => {
  try {
    console.log('request balance for', req.query.address)
    const network = validateNetwork(req.query.network)
    const address = req.query.address

    const crypto = new cryptoManager({ name: network })
    const balance = await crypto.getBalance(address)

    res.status(200).json(balance)
  } catch (err) {
    next(err)
  }
})

// transfer
router.post('/transfer', authArea, async (req, res, next) => {
  try {
    const network = validateNetwork(req.body.network)
    const sender = req.body.sender
    const recipient = req.body.recipient
    const transferAmount = req.body.transferAmount

    // check that recipient is part of the system
    const recipientAccount = await Account.findOne({
      user: req.user._id,
      address: recipient,
      network: network,
    })

    if (!recipientAccount || !recipientAccount.privateKey)
      throw new Error('Recipient Account not found')

    const account = await Account.findOne({
      user: req.user._id,
      address: sender,
      network: network,
    })

    if (!account || !account.privateKey)
      throw new Error('Sender Account not found')

    const crypto = new cryptoManager({ name: network })
    const transaction = await crypto.transfer(
      sender,
      recipient,
      transferAmount,
      account.privateKey,
    )
    res.status(200).json(transaction)
  } catch (err) {
    next(err)
  }
})

// create Account
router.post('/account', authArea, async (req, res, next) => {
  try {
    const network = validateNetwork(req.body.network)
    const crypto = new cryptoManager({ name: network })
    const account = await crypto.createAccount()

    const newAccount = new Account({
      user: req.user._id,
      address: account.address,
      privateKey: account.privateKey,
      network: network,
    })
    await newAccount.save()

    res.status(200).json(account)
  } catch (err) {
    next(err)
  }
})

// get transaction
router.get('/transaction', authArea, async (req, res, next) => {
  try {
    const network = validateNetwork(req.query.network)
    const txHash = req.query.txHash

    const crypto = new cryptoManager({ name: network })
    const transaction = await crypto.getTransaction(txHash)
    res.status(200).json(transaction)
  } catch (err) {
    next(err)
  }
})

// get transaction count
router.get('/transaction-count', async (req, res, next) => {
  try {
    const network = validateNetwork(req.query.network)
    const address = req.query.address

    const crypto = new cryptoManager({ name: network })
    const transactionCount = await crypto.getTransactionCount(address)
    res.status(200).json(transactionCount)
  } catch (err) {
    next(err)
  }
})

// get account history
router.get('/account-history', async (req, res, next) => {
  try {
    const network = validateNetwork(req.query.network)
    const address = req.query.address

    const crypto = new cryptoManager({ name: network })
    const accountHistory = await crypto.getAccountHistory(address)
    res.status(200).json(accountHistory)
  } catch (err) {
    next(err)
  }
})

export default router
