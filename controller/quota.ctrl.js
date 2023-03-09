import moment from 'moment'

import User from './models/user'
import Order from './models/order'
import Quota from './models/quota'
import Subscription from './models/subscription'
import NodeCache from 'node-cache'
import { DEFAULT_QUOTA_LIMIT } from '../config'

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 })

export const decrementUserRequests = async (apiId, userId) => {
  const periodStart = moment().startOf('day').toDate()
  const periodEnd = moment().endOf('day').toDate()

  const quotas = await Quota.find({
    'order.user': userId,
    apiID: apiId,
    periodStart: periodStart,
    periodEnd: periodEnd,
  })

  if (!quotas || quotas.length === 0) {
    return
  }

  const decrementQuotaPromises = quotas.map(async (quota) => {
    if (quota.used > 0) {
      quota.used -= 1
      await quota.save()
    }
  })

  await Promise.all(decrementQuotaPromises)
}

const getDefaultQuotaLimit = async (userId, apiId) => {
  const latestOrder = await getLatestActiveOrder(userId)
  const subscription = latestOrder.subscription

  const apiQuota = subscription.apiQuotas[apiId]
  if (!apiQuota) {
    // throw new Error(`API ${apiId} not found in subscription`)
    return DEFAULT_QUOTA_LIMIT
  }

  return apiQuota.limit
}

export const incrementUserRequests = async (apiId, userId) => {
  const periodStart = moment().startOf('day').toDate()
  const periodEnd = moment().endOf('day').toDate()

  const latestOrder = await Order.findOne({ user: userId, status: 'active' })
    .sort({ date: -1 })
    .populate('subscription')

  if (!latestOrder) {
    throw new Error('No active subscription found for user')
  }

  const quota = await Quota.findOne({
    order: latestOrder._id,
    apiID: apiId,
    periodStart: periodStart,
    periodEnd: periodEnd,
  })

  if (!quota) {
    const newQuota = new Quota({
      order: latestOrder._id,
      apiID: apiId,
      quotaLimit: latestOrder.subscription.apiQuotas[apiId].limit,
      periodStart: periodStart,
      periodEnd: periodEnd,
      used: 1,
    })

    await newQuota.save()
    return
  }

  if (quota.used >= quota.quotaLimit) {
    throw new Error('Quota limit exceeded')
  }

  quota.used += 1
  await quota.save()
}

const getLatestActiveOrder = async (userId) => {
  const cachedOrder = cache.get(`latest_order_${userId}`)
  if (cachedOrder) {
    return cachedOrder
  }

  const latestOrder = await OrderModel.findOne({
    user: userId,
    status: 'active',
  })
    .sort('-date')
    .populate('subscription')
    .exec()

  if (!latestOrder) {
    throw new Error('No active orders found for user')
  }

  cache.set(`latest_order_${userId}`, latestOrder)
  return latestOrder
}
