const { network, ethers } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 0;

async function buyItem() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNFT");
    const listing = await nftMarketplace.getListing(basicNft.address, TOKEN_ID);
    const price = listing.price.toString();
    const transaction = await nftMarketplace.buyItem(
        basicNft.address,
        TOKEN_ID,
        { value: price }
    );
    await transaction.wait(1);
    console.log("NFT bought!");
    if (network.config.chainId == "31337") {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

buyItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
