--- Import the client

The following example shows how to import the client and configure it to use your API key and entity secret:
```
const {
  initiateDeveloperControlledWalletsClient,
} = require('@circle-fin/developer-controlled-wallets')
const client = initiateDeveloperControlledWalletsClient({
  apiKey: '<your-api-key>',
  entitySecret: '<your-entity-secret>',
})

```

--- Create a transaction
The following example shows how to create a transaction using the client:

JavaScript
const response = await client.createTransaction({
  amounts: ['0.01'],
  destinationAddress: '0xa51c9c604b79a0fadbfed35dd576ca1bce71da0a',
  tokenId: '738c8a6d-8896-46d1-b2cb-083600c1c69b',
  walletId: 'a635d679-4207-4e37-b12e-766afb9b3892',
  fee: { type: 'level', config: { feeLevel: 'HIGH' } },
})
console.log(response.data)

--- getWalletTokenBalance
Node.js,latest
SDK iconGo to NPM
Fetches the digital asset balance for a single developer-controlled wallet using its unique identifier.

Parameters
input
object
Required
Represents the input for retrieving the token balance of a wallet.


Show 8 properties
id
string
Required
The ID of the wallet to retrieve the tokens for.

includeAll
boolean
Specifies whether to include all tokens.

name
string
The name of the token to filter for.

standard
string
Token standard.

Allowed values
ERC1155
ERC20
ERC721
Fungible
FungibleAsset
NonFungible
NonFungibleEdition
ProgrammableNonFungible
ProgrammableNonFungibleEdition
tokenAddresses
array of strings
An array of token addresses.

pageAfter
string
Used to return items after the specified item exclusively. SHOULD NOT be used in conjunction with pageBefore.

pageBefore
string
Used to return items before the specified item exclusively. SHOULD NOT be used in conjunction with pageAfter.

pageSize
number
The number of items to return.
e.g.
const response = await client.getWalletTokenBalance({
  id: 'e518abf8-882d-4fa1-931e-596b28aa970b',
})
console.log(response.data?.tokenBalances)

--- const response = await client.estimateTransferFee({
  amount: ['0.01'],
  destinationAddress: '656d6fd6-d430-459c-9ba4-5c2074433f1b',
  tokenId: '9606f293-5b81-4970-acd3-c35c157461c2',
})
console.log(response.data)

Estimates gas fees that will be incurred for a transfer transaction; given its amount, blockchain, and token.

Parameters
input
object
Required
Represents the input parameters for estimating transfer fees.

option 1:

Show 6 properties
tokenId
string
Required
System generated identifier of the token. Excluded with tokenAddress and tokenBlockchain.

amount
array of strings
Required
Specifies the transfer amount in decimal format.

destinationAddress
string
Required
The recipient's blockchain address.

nftTokenIds
array of strings
The list of NFT IDs to be transferred/batchTransferred for NFT withdrawal. Note: Only ERC-1155 tokens support safeBatchTransferFrom.

sourceAddress
string
The source blockchain address of the transaction.

walletId
string
Identifier for the originating wallet.

option 2:

Show 7 properties
blockchain
string
Blockchain of the transferred token. Required if tokenId is not provided. The blockchain and tokenId fields are mutually exclusive.

Allowed values
ARB
ARB-SEPOLIA
AVAX
AVAX-FUJI
BASE
BASE-SEPOLIA
ETH
ETH-SEPOLIA
MATIC
MATIC-AMOY
OP
OP-SEPOLIA
SOL
SOL-DEVNET
UNI
UNI-SEPOLIA
tokenAddress
string
Required
Blockchain address of the transferred token. Empty for native tokens. Excluded with tokenId.

amount
array of strings
Required
Specifies the transfer amount in decimal format.

destinationAddress
string
Required
The recipient's blockchain address.

nftTokenIds
array of strings
The list of NFT IDs to be transferred/batchTransferred for NFT withdrawal. Note: Only ERC-1155 tokens support safeBatchTransferFrom.

sourceAddress
string
The source blockchain address of the transaction.

walletId
string
Identifier for the originating wallet.

--- Confirms that a specified address is valid for a given token on a certain blockchain.

Parameters
input
object
Required
Represents the input parameters for validating an address.


Show 2 properties
address
string
Required
The blockchain address to be validated.

blockchain
string
Required
The blockchain network that the resource is to be created on or is currently on.

Allowed values
ARB
ARB-SEPOLIA
AVAX
AVAX-FUJI
BASE
BASE-SEPOLIA
ETH
ETH-SEPOLIA
EVM
EVM-TESTNET
MATIC
MATIC-AMOY
NEAR
NEAR-TESTNET
OP
OP-SEPOLIA
SOL
SOL-DEVNET
UNI
UNI-SEPOLIA

e.g. const response = await client.validateAddress({
  address: '0xa95f8fafb3f6ae0f9ba7204eef07bde7a64cf2bc',
  blockchain: 'ETH-SEPOLIA',
})
console.log(response.data?.isValid)


--- Lists all transactions. Includes details such as status, source/destination, and transaction hash.

Parameters
input
object
Defines the parameters for querying a list of transactions.


Show 13 properties
blockchain
string
The blockchain network that the resource is to be created on or is currently on.

Allowed values
ARB
ARB-SEPOLIA
AVAX
AVAX-FUJI
BASE
BASE-SEPOLIA
ETH
ETH-SEPOLIA
EVM
EVM-TESTNET
MATIC
MATIC-AMOY
NEAR
NEAR-TESTNET
OP
OP-SEPOLIA
SOL
SOL-DEVNET
UNI
UNI-SEPOLIA
destinationAddress
string
Filters transactions based on their destination address.

includeAll
boolean
Determines if the query should include all tokens. If set to true, results will include all tokens.

operation
string
Operation type of the transaction.

Allowed values
CONTRACT_DEPLOYMENT
CONTRACT_EXECUTION
TRANSFER
state
string
Current state of the transaction.

Allowed values
CANCELLED
COMPLETE
CONFIRMED
DENIED
FAILED
INITIATED
PENDING_RISK_SCREENING
QUEUED
SENT
txHash
string
Filters for a specific transaction hash.

txType
string
Filters transactions based on their type.

Allowed values
INBOUND
OUTBOUND
walletIds
array of strings
Filters transactions based on the owning wallets. Input should be an array of walletIds.

from
string
Start time of the query, inclusive.

pageAfter
string
Used to return items after the specified item exclusively. SHOULD NOT be used in conjunction with pageBefore.

pageBefore
string
Used to return items before the specified item exclusively. SHOULD NOT be used in conjunction with pageAfter.

pageSize
number
The number of items to return.

to
string
End time of the query, inclusive. Defaults to the current time.

e.g. 
const response = await client.listTransactions()
console.log(response.data?.transactions)

--- Retrieves info for a single transaction using it's unique identifier.

Parameters
input
object
Required
Represents the input for retrieving a transaction.


Show 2 properties
id
string
Required
The ID of the transaction to retrieve.

txType
string
Filters on the transaction type of the transaction.

Allowed values
INBOUND
OUTBOUND

e.g. const response = await client.getTransaction({
  id: '9fcb2e86-dec2-4226-81d1-4dbad429278c',
})
console.log(response.data?.transaction)

--- Accelerates a specified transaction from a developer-controlled wallet.

Additional gas fees may be incurred.

Parameters
input
object
Required
Represents the input parameters for accelerating a transaction.


Show 2 properties
id
string
Required
The ID of the transaction to be accelerated.

idempotencyKey
string
The optional idempotency key. An idempotency key is a unique identifier used to identify and handle duplicate requests in order to ensure idempotent behavior, where multiple identical requests have the same effect as a single request.

We will generate one if you do not provide it.

e.g. const response = await client.accelerateTransaction({
  id: "transaction-id",
})
console.log(response.data?.id)

--- Cancels a specified transaction from a developer-controlled wallet. Gas fees may still be incurred.

This is a best-effort operation, it won't be effective if the original transaction has already been processed by the blockchain.

Parameters
input
object
Required
Represents the input parameters for cancelling a transaction.


Show 2 properties
id
string
Required
The ID of the transaction to be cancelled.

idempotencyKey
string
The optional idempotency key. An idempotency key is a unique identifier used to identify and handle duplicate requests in order to ensure idempotent behavior, where multiple identical requests have the same effect as a single request.

We will generate one if you do not provide it.

e.g. const response = await client.cancelTransaction({
  id: "transaction-id",
})
console.log(response.data)