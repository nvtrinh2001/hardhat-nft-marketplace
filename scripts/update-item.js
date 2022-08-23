const { network, ethers } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 0;
const NEW_PRICE = ethers.utils.parseEther("0.5");

async function updateItem() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNFT");
    const transaction = await nftMarketplace.updateListing(
        basicNft.address,
        TOKEN_ID,
        NEW_PRICE
    );
    await transaction.wait(1);
    console.log("NFT updated!");
    if (network.config.chainId == "31337") {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

updateItem()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
