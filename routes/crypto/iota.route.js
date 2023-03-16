import express from 'express'
import dotenv from 'dotenv'

import { cryptoManager } from '../../controller/networks/index.ctrl.js'
import debug from '../../utils/logger.js'

dotenv.config({ path: './.env' })

const router = express.Router()

// create iota address
router.post('/account', async (req, res, next) => {
  try {
    const crypto = new cryptoManager({ name: 'IOTA' })
    const account = await crypto.createAccount()

    res.status(200).json(account)
  } catch (err) {
    next(err)
  }
})

// list all accounts
router.get('/account', async (req, res, next) => {
  try {
    const crypto = new cryptoManager({ name: 'IOTA' })
    const accounts = await crypto.listAccounts()

    res.status(200).json(accounts)
  } catch (err) {
    next(err)
  }
})

// create token
router.post('/token', async (req, res, next) => {
  try {
    const crypto = new cryptoManager({ name: 'IOTA' })
    const token = await crypto.createToken()

    res.status(200).json(token)
  } catch (err) {
    next(err)
  }
})

// generate seed
router.get('/seed', async (req, res, next) => {
  try {
    const crypto = new cryptoManager({ name: 'IOTA' })
    const seed = await crypto.generateSeed()

    res.status(200).json(seed)
  } catch (err) {
    next(err)
  }
})

export default router
