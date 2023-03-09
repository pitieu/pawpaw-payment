export default [
  {
    name: 'Free',
    apiQuotas: {
      'GET /api/v1/transactions': 10000,
      'POST /api/v1/crypto/account': 10000,
    },
    apiQuota: 10000,
    plan: 'free',
    status: 'active',
    price: 0,
    description: 'Free subscription',
    features: ['10000 API interactions per day'],
  },
  {
    name: 'Developer',
    apiQuotas: {
      'GET /api/v1/transactions': 200000,
      'POST /api/v1/crypto/account': 200000,
    },
    apiQuota: 200000,
    plan: 'developer',
    status: 'active',
    price: 5000,
    description: 'Developer subscription',
    features: ['100.000 transactions per month', 'Direct Customer Support'],
  },
  {
    name: 'Team',
    apiQuotas: {
      'GET /api/v1/transactions': 1000000,
      'POST /api/v1/crypto/account': 1000000,
    },
    apiQuota: 1000000,
    plan: 'team',
    status: 'active',
    price: 22500,
    description: 'Team subscription',
    features: ['100.000 transactions per month', 'Direct Customer Support'],
  },
  {
    name: 'Growth',
    apiQuotas: {
      'GET /api/v1/transactions': 5000000,
      'POST /api/v1/crypto/account': 5000000,
    },
    apiQuota: 5000000,
    plan: 'growth',
    status: 'active',
    price: 100000,
    description: 'Growth subscription',
    features: ['100.000 transactions per month', 'Direct Customer Support'],
  },
]
