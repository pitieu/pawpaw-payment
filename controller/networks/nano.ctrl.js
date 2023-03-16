import NanoJS from '@tanishq-singh/nanojs'
import axios from 'axios'

const headers = {
  Authorization: `${MYNANO_API_KEY}`,
}

// create a class to manage an instance of eth network
export class NanoNetwork {
  constructor({ nodeUrl }) {
    this.nano = new NanoJS({
      url: nodeUrl,
      axiosOptions: {
        headers: headers,
      },
    })
  }

  async getWallet() {
    const walletPath = './data/crypto/nano_wallet.json'
    const walletPassword = 'NQFacksJW@*Nd821'
    let wallet

    // Check if the wallet file exists
    if (fs.existsSync(walletPath)) {
      // Wallet file exists, import the wallet data
      const walletData = require(walletPath)
      wallet = await nano.wallet.import({
        data: walletData,
        password: walletPassword,
      })
    } else {
      // Wallet file does not exist, create a new wallet and export it
      wallet = await nano.wallet.create({
        password: walletPassword,
      })
      await nano.wallet.export({
        id: wallet.id,
        password: walletPassword,
        path: walletPath,
      })
    }
    return wallet
  }

  // generate a new account in nano network
  async createAccount() {
    const wallet = await this.getWallet()
    const account = Nano.createAccount(wallet)
    return account
  }

  // get block number
  async getBlockNumber() {
    const blockCount = await this.nano.blocks.count()
    return blockCount
  }

  // sign transaction
  async signTransaction(tx, privateKey) {}

  // send signed transaction
  async sendSignedTransaction(signedTx) {}

  // TODO: move transfer function to other server including privateKey?
  // transfer eth from sender to recipient
  async transfer(sender, recipient, transferAmount, privateKey) {
    // Add the new account to the node's account database
    await node.accounts.create(privateKey)

    // Convert the amount to raw units
    const rawAmount = Nano.convert(transferAmount, 'nano', 'raw')

    // Check the source account's balance
    const accountInfo = await node.accounts.info(sender)
    if (accountInfo.balance < rawAmount) {
      throw new Error('Insufficient Nano balance')
    }

    // Send the Nano to the destination account
    const block = await node.blocks.create.send(sender, recipient, rawAmount)

    // Wait for the transaction to confirm
    await node.blocks.await(block.block.hash)
  }

  //get transaction by hash
  async getTransaction(txHash) {}

  // get the transaction history of an account since the genesis block
  async getAccountHistory() {}

  // get pending transactions
  async getPendingTransactions() {}

  // get transaction count of an account
  async getTransactionCount(address) {}

  // get the balance of an account
  async balance(address) {}

  // get the gas price
  async gasPrice() {}

  // get the gas prices
  async gasPrices() {}

  async changeGasPriceUrl(gasPriceUrl) {}

  async changeNodeUrl(nodeUrl) {}
}
