import mongoose from 'mongoose'
import uniqueValidator from 'mongoose-unique-validator'

export const ethBlocksSchema = new mongoose.Schema({})
ethBlocksSchema.plugin(uniqueValidator)

const EthBlocks = mongoose.model('EthBlocks', ethBlocksSchema)

export default EthBlocks
