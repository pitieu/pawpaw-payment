import Web3 from 'web3'

// create a class to manage an instance of eth network
export class EthNetwork {
  constructor({ nodeUrl, websocketUrl, gasPriceUrl }) {
    if (nodeUrl) {
      this.provider = new Web3.providers.HttpProvider(nodeUrl)
    } else {
      this.provider = new Web3.providers.WebsocketProvider(websocketUrl)
    }
    this.web3 = new Web3(this.provider)

    this.GAS_PRICE_URL = gasPriceUrl
    this.GAS_PRICE = 0
  }

  // generate a new account
  async createAccount() {
    return this.web3.eth.accounts.create()
  }

  // get block number
  async getBlockNumber() {
    return this.web3.eth.getBlockNumber()
  }

  // sign transaction
  async signTransaction(tx, privateKey) {
    return this.web3.eth.accounts.signTransaction(tx, privateKey)
  }

  // send signed transaction
  async sendSignedTransaction(signedTx) {
    return this.web3.eth.sendSignedTransaction(signedTx)
  }

  // TODO: move transfer function to other server including privateKey?
  // transfer eth from sender to recipient
  async transfer(sender, recipient, transferAmount, privateKey) {
    // Set the amount to transfer in wei (1 ETH = 1e18 wei)
    const amount = this.web3.utils.toWei(transferAmount, 'wei')

    const gasPrices = await gasPrices()
    // Create a new transaction object with the appropriate values
    const transactionObject = {
      from: sender,
      to: recipient,
      value: amount,
      gasPrice: gasPrices.fast,
      gas: 21000,
    }

    await signTransaction(transactionObject, privateKey)
      .on('transactionHash', function (hash) {
        console.log('Transaction Hash:', hash)
      })
      .on('receipt', function (receipt) {
        console.log('Transaction Receipt:', receipt)
      })
      .on('error', function (error) {
        console.error('Error:', error)
      })
  }

  //get transaction by hash
  async getTransaction(txHash) {
    return this.web3.eth.getTransaction(txHash)
  }

  // get the transaction history of an account since the genesis block
  async getAccountHistory() {
    const endBlockNumber = await this.web3.eth.getBlockNumber()
    const startBlockNumber = endBlockNumber - 2
    const myaccount = '*'
    console.log(startBlockNumber, endBlockNumber)
    var block = await this.web3.eth.getBlock(12341242, true)
    for (var i = startBlockNumber; i <= endBlockNumber; i++) {
      console.log('Searching block ' + i)
      var block = await this.web3.eth.getBlock(i, true)
      //   console.log(block)
      if (block != null && block.transactions != null) {
        block.transactions.forEach(function (e) {
          if (myaccount == '*' || myaccount == e.from || myaccount == e.to) {
            console.log(
              '  tx hash          : ' +
                e.hash +
                '\n' +
                '   nonce           : ' +
                e.nonce +
                '\n' +
                '   blockHash       : ' +
                e.blockHash +
                '\n' +
                '   blockNumber     : ' +
                e.blockNumber +
                '\n' +
                '   transactionIndex: ' +
                e.transactionIndex +
                '\n' +
                '   from            : ' +
                e.from +
                '\n' +
                '   to              : ' +
                e.to +
                '\n' +
                '   value           : ' +
                e.value +
                ' ' +
                e.value / 1e18 +
                ' ETH' +
                '\n' +
                '   time            : ' +
                block.timestamp +
                ' ' +
                new Date(block.timestamp * 1000).toGMTString() +
                '\n' +
                '   gasPrice        : ' +
                e.gasPrice +
                ' ' +
                (e.gasPrice * e.gas) / 1e18 +
                ' ETH' +
                '\n' +
                '   gas             : ' +
                e.gas +
                '\n' +
                '   input           : ' +
                e.input,
            )
          }
        })
      }
    }

    // const txs = await this.web3.eth.getTransactionFromBlock(address, 1)
    // return txs
  }

  // get pending transactions
  async getPendingTransactions() {
    return this.web3.eth.getPendingTransactions()
  }

  // get transaction count of an account
  async getTransactionCount(address) {
    return this.web3.eth.getTransactionCount(address)
  }

  // get the balance of an account
  async balance(address) {
    const wei = await this.web3.eth.getBalance(address)
    const balance = this.web3.utils.fromWei(wei, 'ether')
    return balance
  }

  // get the gas price
  async gasPrice() {
    return this.web3.eth.getGasPrice()
  }

  // get the gas prices
  async gasPrices() {
    const response = await fetch(this.GAS_PRICE_URL)
    const { data } = await response.json()
    return data
  }

  async changeGasPriceUrl(gasPriceUrl) {
    this.GAS_PRICE_URL = gasPriceUrl
  }

  async changeNodeUrl(nodeUrl) {
    this.provider = new Web3.providers.HttpProvider(nodeUrl)
    this.web3 = new Web3(this.provider)
  }
}
