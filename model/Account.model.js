import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

//TODO: eventually the private key will be moved to a different server
export const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: { type: String, required: true },
    privateKey: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deleted_at: { type: Date },
    deleted_reason: { type: String },
  },
  { timestamps: true },
)
accountSchema.plugin(uniqueValidator)

const Account = mongoose.model('Account', accountSchema)

export default Account
