import mongoose from 'mongoose'

export const quotaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    apiID: {
      type: String,
      required: true,
    },
    quotaLimit: {
      type: Number,
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    used: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

const Quota = mongoose.model('Quota', quotaSchema)

export default Quota
