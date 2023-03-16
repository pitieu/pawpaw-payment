import bcrypt from 'bcryptjs'

import debug from '../utils/logger.js'
import User from '../model/User.model.js'
import { signJWT } from '../utils/jwt.utils.js'

import { loginValidation } from '../validation/auth.validation.js'

export const validatePassword = (password, userPassword) => {
  return bcrypt.compare(password, userPassword)
}

export const login = async (data) => {
  const validateLogin = loginValidation(data)
  if (validateLogin.error)
    throw {
      error: validateLogin.error?.details[0]?.message,
      status: 400,
      error_field: validateLogin.error?.details[0]?.context?.key,
      error_type: validateLogin.error?.details[0]?.type,
      error_code: 100,
    }

  let user = await User.findOne(
    {
      email: data.email,
      deleted: false,
    },
    {
      _id: 1,
      email: 1,
      password: 1,
    },
  ).lean()

  if (!user)
    throw {
      error: 'Account not found',
      status: 400,
      error_code: 101,
    }
  const validPassword = await validatePassword(data.password, user.password)
  if (!validPassword)
    throw {
      error: 'invalid password',
      status: 400,
      error_code: 102,
    }

  const payload = {
    _id: user._id,
    email: user.email,
  }
  delete user.password
  const accessToken = signJWT(payload, process.env.ACCESS_TOKEN_SECRET, '1y')
  const refreshToken = signJWT(payload, process.env.REFRESH_TOKEN_SECRET, '1y')
  return { accessToken: accessToken, refreshToken: refreshToken, user: user }
}
