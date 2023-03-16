import Subscription from '../model/Subscription.model.js'
import SubscriptionData from '../data/subscriptions.js'

export const addSubscriptions = async () => {
  try {
    const count = await Subscription.find({}).count()
    if (!count) {
      await Subscription.insertMany(SubscriptionData)
    }
  } catch (e) {
    console.log(e)
  }
}
