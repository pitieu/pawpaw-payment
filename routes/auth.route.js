import express from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

import debug from '../utils/logger.js'
import { login } from '../controller/auth.ctrl.js'
import { createUser, fetchUser } from '../controller/account.ctrl.js'
import { authArea } from '../middleware/auth.middleware.js'
import { User } from '../model/User.model.js'
import { ApiKey } from '../model/ApiKey.model.js'

dotenv.config({ path: './.env' })

const router = express.Router()

let refreshTokens = []

// ----------------------------------------------------------------------
// Implementation of Routes
// ----------------------------------------------------------------------

const _register = async (req, res, next) => {
  try {
    const userData = await createUser(req.body)
    req.body.user_id = userData._id

    res.status(201).json({
      message: 'account successfully created',
      status: 201,
    })
  } catch (err) {
    next(err)
  }
}

const _login = async (req, res, next) => {
  try {
    const tokens = await login(req.query)

    res.cookie('accessToken', tokens.accessToken, {
      maxAge: 300000, // 5 minutes
      httpOnly: true,
    })
    res.cookie('refreshToken', tokens.refreshToken, {
      maxAge: 3.154e10, // 1 year
      httpOnly: true,
    })

    refreshTokens.push(tokens.refreshToken)
    res.header('auth-token', tokens.accessToken).status(200).json({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: tokens.user,
      status: 200,
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

const _token = (req, res) => {
  try {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)
      const accessToken = generateAccessToken({ username: user.name })
      res
        .header('auth-token', accessToken)
        .status(200)
        .json({ access_token: accessToken, status: 200 })
    })
  } catch (err) {
    console.log(err)
    next(err)
  }
}

const _logout = (req, res) => {
  res.cookie('accessToken', '', {
    maxAge: 0,
    httpOnly: true,
  })
  res.cookie('refreshToken', '', {
    maxAge: 0,
    httpOnly: true,
  })

  refreshTokens = refreshTokens.filter((token) => token !== req.body.token)
  res.sendStatus(204)
}

const _generateApiKey = async (req, res) => {
  try {
    const { _id } = req.user
    // check if user exists
    const user = await fetchUser({ _id: _id })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const uuid = uuidv4()

    // generate a new API key
    const apiKey = new ApiKey({
      user: user._id,
      key: uuid, // generate a random string
    })
    await apiKey.save()
    res.status(201).json({ message: 'API key generated', apiKey: apiKey.key })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ----------------------------------------------------------------------
// ROUTES
// ----------------------------------------------------------------------

router.get('/protected', authArea, async (req, res, next) => {
  res.status(200).send('Has access')
})
router.post('/register', _register)
router.get('/login', _login)
router.post('/token', _token)
router.delete('/logout', _logout)

router.post('/api-key', authArea, _generateApiKey)

export default router
