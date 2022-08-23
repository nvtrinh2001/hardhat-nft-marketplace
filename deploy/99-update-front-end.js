const { ethers, network } = require("hardhat");
const {
    FRONT_END_CONTRACTS_FILE,
    FRONT_END_ABI_LOCATION,
} = require("../helper-hardhat-config");
const fs = require("fs");

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating frontend...");
        await updateContractAddresses();
        await updateAbi();
    }
};

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    fs.writeFileSync(
        `${FRONT_END_ABI_LOCATION}NftMarketplaceAbi.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    );

    const basicNft = await ethers.getContract("BasicNFT");
    fs.writeFileSync(
        `${FRONT_END_ABI_LOCATION}BasicNftAbi.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    );
}

async function updateContractAddresses() {
    const nftMarketplace = await ethers.getContract("NftMarketplace");
    const chainId = network.config.chainId;
    const contractAddresses = JSON.parse(
        fs.readFileSync(FRONT_END_CONTRACTS_FILE, "utf8")
    );

    if (chainId in contractAddresses) {
        if (
            !contractAddresses[chainId]["NftMarketplace"].includes(
                nftMarketplace.address
            )
        ) {
            contractAddresses[chainId]["NftMarketplace"].push(
                nftMarketplace.address
            );
        }
    } else {
        contractAddresses[chainId] = {
            NftMarketplace: [nftMarketplace.address],
        };
    }
    fs.writeFileSync(
        FRONT_END_CONTRACTS_FILE,
        JSON.stringify(contractAddresses)
    );
}

module.exports.tags = ["all", "frontend"];
