import User from '../model/User.model.js'
import Account from '../model/Account.model.js'
import PostalCode from '../model/PostalCode.model.js'
import { registrationValidation } from '../validation/auth.validation.js'
import debug from '../utils/logger.js'
import { mongooseInstance } from '../mongodb/mongo.js'

export const fetchUser = async (query = {}, options) => {
  query.deleted = false
  let user = User.findOne(query, options)

  return await user.lean()
}

export const fetchAccounts = async (query = {}, options) => {
  query.deleted = false
  const user = await User.findOne(query, options).lean()
  const accounts = await Account.find({ user_id: user._id }).lean()
  return accounts
}

export const createUser = async (data, session) => {
  let userData = await fetchUser({
    email: data.email,
    deleted: false,
  })
  if (!userData) {
    const hashedPassword = await User.hashPassword(data.password)
    userData = await User.insertMany(
      [
        {
          phone: data.phone,
          phone_ext: data.phone_ext,
          password: hashedPassword,
        },
      ],
      { session: session },
    )
    userData = userData[0]
  }
  return userData
}

export const selectAccount = async (data) => {
  const count = await Account.count({
    user_id: data.user_id,
    _id: data.account_id,
  })
  if (!count) {
    throw { error: 'could not find selected account', status: 400 }
  }
  return await User.findOneAndUpdate(
    {
      phone: data.phone,
      phone_ext: data.phone_ext,
      deleted: false,
    },
    { selected_account: data.account_id },
    { new: true },
  ).populate('selected_account')
}

export const accountsCountByPhone = async (phone, phone_ext) => {
  const user = await User.findOne({
    phone: phone,
    phone_ext: phone_ext,
    deleted: false,
  }).lean()

  const count = await Account.count({ user_id: user._id })

  return count
}

export const accountsCountByUserId = async (userId) => {
  const count = await Account.count({ user_id: userId })

  return count
}

export const usernameExists = async (username) => {
  const userByUsername = await Account.count({ username: username })
  return !!userByUsername
}

export const createAccount = async (data = {}, session) => {
  // TODO: prevent user to create account if he is in a ban list
  const validateRegister = registrationValidation(data)
  if (validateRegister.error) {
    throw {
      error: validateRegister.error?.details[0]?.message,
      status: 400,
      error_field: validateRegister.error?.details[0]?.context?.key,
      error_type: validateRegister.error?.details[0]?.type,
      error_code: 100,
    }
  }

  const acctCount = await accountsCountByUserId(data.user_id)
  if (acctCount >= 5) {
    throw {
      error: 'maximum of 5 accounts reached per phone number',
      status: 400,
      error_code: 103,
    }
  }

  const usernameExist = await usernameExists(data.username)
  if (usernameExist) {
    throw { error: 'username already exists', status: 400, error_code: 104 }
  }

  let accountData = await Account.create(
    [
      {
        user_id: data.user_id,
        username: data.username,
      },
    ],
    { session },
  )
  accountData = accountData[0]
  await User.updateOne(
    { phone: data.phone, phone_ext: data.phone_ext },
    { selected_account: accountData._id },
    { session },
  )
  return accountData
}

export const searchAddress = async (search) => {
  const searchWords = search.split(' ')
  let query = []
  // match by word
  searchWords.forEach((word) => {
    const reg = new RegExp(word)
    query.push({ 'province.province_name': { $regex: reg, $options: 'i' } })
    query.push({ sub_district: { $regex: reg, $options: 'i' } })
    query.push({ city: { $regex: reg, $options: 'i' } })
  })

  const total = await PostalCode.aggregate([
    {
      $lookup: {
        from: 'provinces',
        localField: 'province_id',
        foreignField: '_id',
        as: 'province',
      },
    },
    {
      $unwind: {
        path: '$province',
      },
    },
    {
      $match: {
        $or: query,
      },
    },
    {
      $project: {
        _id: true,
        searchField: {
          $concat: [
            '$province.province_name',
            ', ',
            '$city',
            ', ',
            '$sub_district',
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        // sub_district: '$sub_district',
        // city: '$city',
        // province_code: '$province_code',
        // postal_code: '$postal_code',
        // province: '$province',
        // province_en: '$province_en',
        searchField: { $addToSet: '$searchField' },
      },
    },
    {
      $unwind: {
        path: '$searchField',
      },
    },
  ])

  return total
}
