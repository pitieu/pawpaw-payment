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
  })
  if (!userData) {
    const hashedPassword = await User.hashPassword(data.password)
    userData = await User.insertMany(
      [
        {
          email: data.email,
          password: hashedPassword,
        },
      ],
      { session: session },
    )
    userData = userData[0]
  }
  return userData
}

export const usernameExists = async (username) => {
  const userByUsername = await Account.count({ username: username })
  return !!userByUsername
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
