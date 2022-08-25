const { network, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config.js");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    let args = [];
    const nftMarketplace = await deploy("NftMarketplace", {
        from: deployer,
        log: true,
        args,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API
    ) {
        log("Verifying...");
        await verify(nftMarketplace.address, args);
    }
    log("------------------------------------");
};

module.exports.tags = ["all", "nftmarketplace"];
