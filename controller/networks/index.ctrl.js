import { EthNetwork } from './eth.ctrl.js'
import { IOTANetwork } from './iota.ctrl.js'

const networks = {
  ETH: {
    network: 'ETH',
    httpProvider:
      'https://mainnet.infura.io/v3/2c51ffbd0c7d41e1bed5916e12a81208',
    // httpProvider: '', //http://127.0.0.1:8551
    websocketProvider: 'ws://127.0.0.1:8551',
    gasPriceUrl: 'https://ethgasprice.org/api/gas',
  },
  ETH_GORLI: {
    network: 'ETH',
    httpProvider:
      'https://goerli.infura.io/v3/2c51ffbd0c7d41e1bed5916e12a81208',
    gasPriceUrl: '',
  },
  ETH_SEPOLIA: {
    network: 'ETH',
    httpProvider:
      'https://sepolia.infura.io/v3/2c51ffbd0c7d41e1bed5916e12a81208',
    gasPriceUrl: '',
  },
  NANO: {
    network: 'NANO',
    nodeUrl: 'https://mynano.ninja/api/node',
  },
  IOTA: {
    network: 'IOTA',
    nodeUrl: 'https://nodes.devnet.iota.org:443',
    explorer: 'https://explorer.iota.org/devnet/',
  },
}

export class cryptoManager {
  constructor(network) {
    if (networks[network.name].network === 'ETH') {
      this.network = new EthNetwork({
        nodeUrl: networks[network.name].httpProvider,
        websocketUrl: networks[network.name].websocketProvider,
        gasPriceUrl: networks[network.name].gasPriceUrl,
      })
    }
    if (networks[network.name].network === 'NANO') {
      this.network = new EthNetwork({
        nodeUrl: networks[network.name].nodeUrl,
      })
    }
    if (networks[network.name].network === 'IOTA') {
      this.network = new IOTANetwork({
        nodeUrl: networks[network.name].nodeUrl,
      })
    }
    console.log('network', network.name, networks[network.name])
    if (!this.network) throw new Error('Invalid network')
  }

  async getBalance(address) {
    return await this.network.balance(address)
  }

  async transfer(sender, recipient, transferAmount, options) {
    return await this.network.transfer(
      sender,
      recipient,
      transferAmount,
      options,
    )
  }

  async createAccount() {
    return await this.network.createAccount()
  }

  async listAccounts() {
    return await this.network.listAccounts()
  }

  async getTransaction(txHash) {
    return await this.network.getTransaction(txHash)
  }

  async getTransactionCount(address) {
    return await this.network.getTransactionCount(address)
  }

  async getAccountHistory(address) {
    return await this.network.getAccountHistory(address)
  }

  async createToken(name, symbol, decimals, totalSupply) {
    return await this.network.createToken(
      name,
      symbol,
      totalSupply,
      decimals,
      privateKey,
    )
  }

  async generateSeed() {
    return await this.network.generateSeed()
  }
}
