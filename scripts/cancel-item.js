const { network, ethers } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 0;

async function cancelItem() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNFT");
    const transaction = await nftMarketplace.cancelListing(
        basicNft.address,
        TOKEN_ID
    );
    await transaction.wait(1);
    console.log("NFT cancelled!");
    if (network.config.chainId == "31337") {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

cancelItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
