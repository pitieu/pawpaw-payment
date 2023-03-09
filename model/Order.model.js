import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['credit card', 'paypal', 'bank transfer'],
      required: true,
    },
    paymentAmount: { type: Number, required: true },
    paymentDate: { type: Date },
  },
  { timestamps: true },
)

const Order = mongoose.model('Order', orderSchema)

export default Order
