import Iota from '@iota/core'
import { Client, initLogger } from '@iota/client'

import Converter from '@iota/converter'
import crypto from 'crypto'

initLogger()

// create a class to manage an instance of eth network
export class IOTANetwork {
  constructor({ nodeUrl }) {
    this.iota = new Client({ nodes: [nodeUrl], localPow: true })
  }

  async generateSeed() {
    const seed = crypto
      .createHash('sha256')
      .update(crypto.randomBytes(256))
      .digest('hex')

    const mnemonic = await this.iota.generateMnemonic()
    const hexEncodedSeed = await this.iota.mnemonicToHexSeed(mnemonic)
    return {
      seed,
      mnemonic,
      hexEncodedSeed,
    }
  }

  async createAccount() {
    const seed = await this.generateSeed()
    const addresses = await this.iota.generateAddresses(
      { mnemonic: seed.mnemonic },
      {
        index: 0,
        total: 1,
      },
    )

    return {
      address: addresses[0],
      seed: seed.seed,
      mnemonic: seed.mnemonic,
      hexEncodedSeed: seed.hexEncodedSeed,
    }
  }

  async listAccounts() {}

  async getBlockNumber() {
    // IOTA doesn't use block numbers like Ethereum, so this function can return null or undefined
    return null
  }

  async signTransaction(tx, privateKey) {
    // IOTA doesn't use private keys like Ethereum, so this function can return null or undefined
    return null
  }

  async sendSignedTransaction(signedTx) {
    // IOTA doesn't use signed transactions like Ethereum, so this function can return null or undefined
    return null
  }

  async transfer(sender, recipient, transferAmount, options) {
    // Generate a transfer object
    const transfers = [
      {
        address: recipient,
        value: transferAmount,
        message: Converter.asciiToTrytes(
          `${options.tokenName}:${options.tokenSymbol}`,
        ),
      },
    ]

    // Send the transfer
    const trytes = await this.iota.prepareTransfers(sender, transfers)
    const bundle = await this.iota.sendTrytes(trytes, 3, 14)

    console.log('Transfer completed:', bundle[0].hash)
    return bundle[0]
  }

  async getTransaction(txHash) {
    // Get the transaction objects for the given transaction hash
    const transactions = await this.iota.findTransactionObjects({
      address: [txHash],
    })

    if (transactions.length === 0) {
      console.log('Transaction not found:', txHash)
      return null
    }

    console.log('Transaction found:', transactions[0])
    return transactions[0]
  }

  async getAccountHistory(address) {
    // Get the transaction objects for the given address
    const transactions = await this.iota.getAccountData(address)

    console.log('Transaction history for', address, ':', transactions)
    return transactions
  }

  async getPendingTransactions() {
    // Get the list of pending transactions
    const transactions = await this.iota.findTransactionObjects({
      addresses: [],
      tags: [],
      approvees: [],
      bundles: [],
      statuses: ['pending'],
    })

    console.log('Pending transactions:', transactions)
    return transactions
  }

  async getTransactionCount(address) {
    // Get the number of transactions for the given address
    const transactions = await this.iota.findTransactionObjects({
      addresses: [address],
    })

    console.log('Transaction count for', address, ':', transactions.length)
    return transactions.length
  }

  // get the balance of an account
  async balance(address, tokenAddress) {
    try {
      // Use the iota library to get the balance of the specified address
      const balance = await this.iota.getBalances([address], 100)

      // If the balance object is not empty, return the balance of the specified address
      if (balance && balance.balances && balance.balances.length > 0) {
        return balance.balances[0]
      } else {
        return 0
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  // get the gas price
  async gasPrice() {}

  // get the gas prices
  async gasPrices() {}

  async changeGasPriceUrl(gasPriceUrl) {}

  async changeNodeUrl(nodeUrl) {}

  async transferTokens(seed, tokenAddress, address1, address2, amount) {
    // Get the inputs and outputs for the transfer
    const inputs = await this.iota.getInputs(seed)
    const outputs = [
      {
        address: address1,
        value: 0,
        tag: tokenAddress,
      },
      {
        address: address2,
        value: amount,
        tag: tokenAddress,
      },
    ]

    // Create the transfer object
    const transfer = {
      inputs,
      outputs,
    }

    // Sign and send the transfer
    const trytes = await iota.prepareTransfers(seed, [transfer])
    const bundle = await iota.sendTrytes(trytes, 3, 9)

    // Wait for the token transaction to be confirmed
    const tokenTransactionHash = bundle[1].hash
    const tokenTransaction = await waitForTokenConfirmation(
      provider,
      tokenTransactionHash,
    )

    return tokenTransaction
  }

  async createToken(tokenName, symbol, tokenSupply, decimals) {
    const receiveAddressSeed = this.generateSeed()
    const tokenHolderSeed = this.generateSeed()
    const receivingAddress = await this.iota.getNewAddress(receiveAddressSeed)
    const tokenMessage = {
      token: tokenName,
      supply: tokenSupply,
      address: receivingAddress,
      type: 'basic',
    }
    const tokenMessageTrytes = Converter.asciiToTrytes(
      JSON.stringify(tokenMessage),
    )
    const transfer = [
      {
        value: 0,
        address: receivingAddress,
        message: Converter.asciiToTrytes('Token creation'),
        tag: Converter.asciiToTrytes(tokenName),
      },
      {
        value: 0,
        address: tokenHolderSeed,
        message: Converter.asciiToTrytes('Token creation'),
        tag: Converter.asciiToTrytes(tokenName),
        addtionalMessage: tokenMessageTrytes,
      },
    ]
    const trytes = await this.iota.prepareTransfers(
      receiveAddressSeed,
      transfer,
    )
    const bundle = await this.iota.sendTrytes(trytes, 3, 14)
    console.log(
      `Token creation transaction sent: https://explorer.iota.org/devnet/transaction/${bundle[0].hash}`,
    )
    await this.waitForTokenConfirmation(receivingAddress)
    console.log(`Token created and sent to address: ${receivingAddress}`)
    const transferToken = [
      {
        value: 1,
        address: address2,
        message: Converter.asciiToTrytes('Token transfer'),
        tag: Converter.asciiToTrytes(tokenName),
      },
    ]
    const transferTokenTrytes = await prepareTransfers(
      receivingAddress,
      transferToken,
    )
    const transferTokenBundle = await this.iota.sendTrytes(
      transferTokenTrytes,
      3,
      14,
    )
    console.log(
      `Token transfer transaction sent: https://explorer.iota.org/devnet/transaction/${transferTokenBundle[0].hash}`,
    )

    return {
      tokenName,
      symbol,
      tokenSupply,
      decimals,
      tokenHolderSeed,
      receivingAddress,
    }
  }

  async waitForTokenConfirmation(provider, tokenTransactionHash) {
    const iota = composeAPI({ provider })

    let retryCount = 0

    while (true) {
      const transactionObjects = await getTransactionObjects(iota, [
        tokenTransactionHash,
      ])

      if (
        transactionObjects[0].value !== '0' &&
        transactionObjects[0].confirmed
      ) {
        return transactionObjects[0]
      }

      retryCount++
      if (retryCount > 10) {
        throw new Error('Token transaction not confirmed after 10 retries')
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  async waitForTransactionConfirmation(provider, transactionHash) {
    const iota = composeAPI({ provider })

    let retryCount = 0

    while (true) {
      const transactionObjects = Iota.createGetTransactionObjects(iota, [
        transactionHash,
      ])

      if (transactionObjects[0].confirmed) {
        return transactionObjects[0]
      }

      retryCount++
      if (retryCount > 10) {
        throw new Error('Transaction not confirmed after 10 retries')
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}
