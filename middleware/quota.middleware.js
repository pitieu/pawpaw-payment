import moment from 'moment'

import User from './models/user'
import ApiKey from './models/apiKey'
import Quota from './models/quota'
import { incrementUserRequests } from './controller/quota.ctrl'

export const apiQuotaMiddleware = (apiId) => async (req, res, next) => {
  try {
    const apiKey = req.header('api-key')
    if (!apiKey) {
      return res.status(401).json({
        message: 'Invalid API Key',
      })
    }

    const key = await ApiKey.findOne({
      key: apiKey,
      status: 'active',
    }).populate('user')
    if (!key) {
      return res.status(401).json({
        message: 'Invalid API Key',
      })
    }
    const user = key.user
    const userId = user._id

    const periodStart = moment().startOf('day').toDate()
    const periodEnd = moment().endOf('day').toDate()

    const quota = await Quota.findOne({
      user: userId,
      apiID: apiId,
      periodStart: periodStart,
      periodEnd: periodEnd,
    })

    if (!quota) {
      return res.status(429).json({
        message: `Quota exceeded for API with ID ${apiId}`,
      })
    }

    if (quota.used >= quota.quotaLimit) {
      return res.status(429).json({
        message: `Quota exceeded for API with ID ${apiId}`,
      })
    }

    incrementUserRequests(apiId, userId)

    next()
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      message: 'Internal Server Error',
    })
  }
}
