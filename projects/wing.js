
const { default: BigNumber } = require('bignumber.js');
const { get } = require('./helper/http')


const config = {
  ontology: {
    url: 'https://flashapi.wing.finance/api/v1/flashpooldetail',
  },
  ethereum: {
    url: 'https://ethapi.wing.finance/eth/flash-pool/detail',
  },
  okexchain: {
    url: 'https://ethapi.wing.finance/okexchain/flash-pool/detail',
  },
  bsc: {
    url: "https://ethapi.wing.finance/bsc/flash-pool/detail",
  },
  ontology_evm: {
    url: "https://ethapi.wing.finance/ontevm/flash-pool/detail",
  },
  nft_pool:{
    url:"https://nftapi.wing.finance/backend/nft-pool/pool-overview",
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
};

const data = {}

async function getData(chain) {
  const { url } = config[chain]
  if (!data[chain]) data[chain] = get(url)
  return data[chain]
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      if (!result.totalSupply) result.totalSupply = result.TotalSupply
      if (!result.nftCollateralTVL) result.totalSupply += result.nftCollateralTVL
      return {
        tether: BigNumber(result.totalSupply - result.totalBorrow).toFixed(0)
      }
    },
    staking: async () => {
      const { result } = await getData(chain)
      if (!result.totalLockedWingDollar) result.totalLockedWingDollar = result.TotalLockedWingDollar
      if (!result.totalWingInsuranceDollar) result.totalLockedWingDollar += result.totalWingInsuranceDollar
      return {
        tether: BigNumber(result.totalLockedWingDollar).toFixed(0)
      }
    },
    borrowed: async () => {
      const { result } = await getData(chain)
      if (!result.totalBorrow) result.totalBorrow = result.TotalBorrow
      return {
        tether: BigNumber(result.totalBorrow).toFixed(0)
      }
    },
  }
})
