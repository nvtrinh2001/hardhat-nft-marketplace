const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("0.1");

async function mintAndList() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const basicNft = await ethers.getContract("BasicNFT");
    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;

    console.log("Approving Nft...");
    const approvalTx = await basicNft.approve(nftMarketplace.address, tokenId);
    await approvalTx.wait(1);

    console.log("Listing Nft...");
    const listingTx = await nftMarketplace.listItem(
        basicNft.address,
        tokenId,
        PRICE
    );
    await listingTx.wait(1);
    console.log("Listed!");

    if (network.config.chainId == "31337") {
        await moveBlocks(1, (sleepAmount = 1000));
    }
    console.log("---------------------------------------------");
}

mintAndList()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
