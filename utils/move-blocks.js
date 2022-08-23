const { network } = require("hardhat");

// amount: num of blocks that you want to move
// sleepAmount: still time between each block being moved
async function moveBlocks(amount, sleepAmount = 0) {
    console.log("Moving blocks...");
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        });
        if (sleepAmount) {
            console.log(`Sleeping for ${sleepAmount}ms...`);
            await sleep(sleepAmount);
        }
    }
}

function sleep(sleepAmountInMiliseconds) {
    return new Promise((resolve) =>
        setTimeout(resolve, sleepAmountInMiliseconds)
    );
}

module.exports = { moveBlocks, sleep };
