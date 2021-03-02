import stripe from 'stripe'

const client = new stripe(`${process.env.STRIPE_SECRET_KEY}`, {
  apiVersion: '2020-08-27' // '2019-12-03' 
})

export const Stripe = {
  connect: async (code: string) => {
    const response = await client.oauth.token({
      grant_type: 'authorization_code',
      code
    })

    return response
  },

  charge: async (
    amount: number,         // in smallest currency unit like cent/penny
    source: string,         // rentee's payment insormation
    stripeAccount: string   // host's walletId
  ) => {
    const res = await client.charges.create(
      {
        amount,
        currency: 'gbp',
        source,
        application_fee_amount: Math.round(amount * 0.05) // 5% 
      }, 
      { stripe_account: stripeAccount }
    )

    // succeded | pending | failed
    // since function abave awaits for completion this excludes pending
    if (res.status !== 'succeeded') {
      console.log(res)
      throw new Error('Failed to create charge with Stripe.')
    }
  }
}