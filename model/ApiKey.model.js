import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

export const apiKeySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: { type: String, required: true, unique: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deleted: { type: Boolean, default: false },
    deleted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deleted_at: { type: Date },
    deleted_reason: { type: String },
  },
  { timestamps: true },
)
apiKeySchema.plugin(uniqueValidator)

export const ApiKey = mongoose.model('ApiKey', apiKeySchema)

export default ApiKey
