// only mint
const { ethers } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

async function mint() {
    const basicNft = await ethers.getContract("BasicNFT");
    console.log("Minting...");
    const mintTx = await basicNft.mintNft();
    const mintTxReceipt = await mintTx.wait(1);
    const tokenId = mintTxReceipt.events[0].args.tokenId;

    console.log(
        `Got an NFT at address ${basicNft.address} with tokenId ${tokenId}`
    );
    if (network.config.chainId == "31337") {
        await moveBlocks(1, (sleepAmount = 1000));
    }
}

mint()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
