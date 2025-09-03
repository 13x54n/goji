const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets')

export const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET,
})