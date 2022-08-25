# Hardhat NFT Marketplace

Create a Decentralized NFT Marketplace with hardhat framework.

# Getting Started

## Requirements

-   [git](https://git-scm.com/)
-   [nodejs](https://nodejs.org/)
-   [yarn](https://yarnpkg.com/)

## Quick Start

```
git clone git@github.com:nvtrinh2001/hardhat-nft-marketplace.git
cd hardhat-nft
yarn
```

# Deploy

## Deploy on hardhat network

`yarn hardhat deploy`

## Deploy on a Testnet or a Mainnet

1. Setup environment variables

Add all variables into `.env` file, similar to what is in `env.example`

2. Get testnet ETH

Go to [faucets.chain.link](https://faucets.chain.link) and get some testnet ETH & LINK.

3. Deploy the smart contracts

After that, run:

```
yarn hardhat deploy --network rinkeby
```

Only run with `tag: main` as we have to add contract address to Chainlink VRF Consumer in the next step.

# Testing

`yarn hardhat test`

# Test Coverage

```
yarn hardhat coverage
```

# Verify on Etherscan

Get the etherscan API key and put it in the _.env_ file. The token will be automatically verified by running the deployment scripts.

1. `listItem`: list NFTs on the marketplace
2. `buyItem`: buy the NFTs
3. `cancelItem`: cancel a listing
4. `updateListing`: update price
5. `withdrawProceeds`: withdraw payment for the bought NFTs
