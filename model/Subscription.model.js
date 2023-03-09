import mongoose from 'mongoose'

export const subscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    apiQuotas: { type: Object, default: {} },
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'premium'],
      required: true,
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    features: { type: Array, required: true },
  },
  { timestamps: true },
)

const Subscription = mongoose.model('Subscription', subscriptionSchema)

export default Subscription
