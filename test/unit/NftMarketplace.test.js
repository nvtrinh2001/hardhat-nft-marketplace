const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
    developmentChains,
    networkConfig,
} = require("../../helper-hardhat-config");

const TOKEN_ID = 0;
const PRICE = ethers.utils.parseEther("0.1");
const NEW_PRICE = ethers.utils.parseEther("0.2");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace tests", () => {
          let nftMarketplace, basicNft, user, deployer;
          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              user = accounts[1];
              await deployments.fixture(["all"]);
              nftMarketplace = await ethers.getContract(
                  "NftMarketplace",
                  deployer
              );
              basicNft = await ethers.getContract("BasicNFT");
              await basicNft.mintNft();
              await basicNft.approve(nftMarketplace.address, TOKEN_ID);
          });

          describe("listItem", () => {
              it("notListed", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(
                      `NftMarketplace__AlreadyListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });

              it("isOwner", async () => {
                  nftMarketplace = await nftMarketplace.connect(user);
                  await basicNft.approve(nftMarketplace.address, TOKEN_ID);
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(`NftMarketplace__NotOwner()`);
              });

              it("nft price has to be more than 0", async () => {
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, 0)
                  ).to.be.revertedWith(
                      "NftMarketplace__PriceMustBeAboveZero()"
                  );
              });

              it("revert if not approve the marketplace", async () => {
                  await basicNft.approve(
                      ethers.constants.AddressZero,
                      TOKEN_ID
                  );
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(
                      "NftMarketplace__NotApprovedForMarketplace()"
                  );
              });

              it("update s_listings", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );

                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );

                  assert.equal(listing.price.toString(), PRICE.toString());
                  assert.equal(listing.seller, deployer.address);
              });

              it("emit ItemListed event", async () => {
                  expect(
                      await nftMarketplace.listItem(
                          basicNft.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.emit("ItemListed");
              });
          });

          describe("buyItem", () => {
              it("revert if not listed", async () => {
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });

              it("revert if price not met", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );

                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__PriceNotMet("${basicNft.address}", ${TOKEN_ID}, ${listing.price})`
                  );
              });

              it("update amount earned of seller", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  let proceed = await nftMarketplace.getProceeds(
                      deployer.address
                  );
                  assert.equal(proceed, 0);
                  await nftMarketplace.connect(user);
                  await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                      value: PRICE,
                  });
                  proceed = await nftMarketplace.getProceeds(deployer.address);
                  assert.equal(proceed.toString(), PRICE.toString());
              });

              it("update new owner of the nft", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  nftMarketplace = await nftMarketplace.connect(user);
                  await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                      value: PRICE,
                  });
                  const newOwner = await basicNft.ownerOf(TOKEN_ID);

                  assert.equal(newOwner, user.address);
              });

              it("emit ItemBought event", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  expect(
                      await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: PRICE,
                      })
                  ).to.emit("ItemBought");
              });
          });

          describe("cancelListing", () => {
              it("isOwner", async () => {
                  nftMarketplace = await nftMarketplace.connect(user);
                  await basicNft.approve(nftMarketplace.address, TOKEN_ID);
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(`NftMarketplace__NotOwner()`);
              });

              it("isListed", async () => {
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });

              it("delete listing in mapping", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  let listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  assert(listing.price != 0);

                  await nftMarketplace.cancelListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  assert.equal(listing.price.toString(), 0);
              });

              it("emit ItemCancelled event", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );

                  expect(
                      await nftMarketplace.cancelListing(
                          basicNft.address,
                          TOKEN_ID
                      )
                  ).to.emit(
                      `ItemCancelled(${
                          (deployer.address, basicNft.address, TOKEN_ID)
                      })`
                  );
              });
          });

          describe("updateListing", () => {
              it("isOwner", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );

                  nftMarketplace = await nftMarketplace.connect(user);
                  await basicNft.approve(nftMarketplace.address, TOKEN_ID);
                  await expect(
                      nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          NEW_PRICE
                      )
                  ).to.be.revertedWith(`NftMarketplace__NotOwner()`);
              });

              it("isListed", async () => {
                  await expect(
                      nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          NEW_PRICE
                      )
                  ).to.be.revertedWith(
                      `NftMarketplace__NotListed("${basicNft.address}", ${TOKEN_ID})`
                  );
              });

              it("update new price", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  let listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  assert.equal(listing.price.toString(), PRICE.toString());
                  await nftMarketplace.updateListing(
                      basicNft.address,
                      TOKEN_ID,
                      NEW_PRICE
                  );
                  listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  );
                  assert.equal(listing.price.toString(), NEW_PRICE.toString());
              });

              it("emit ItemListed event", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );

                  expect(
                      await nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          NEW_PRICE
                      )
                  ).to.emit(
                      `ItemListed(${
                          (deployer.address,
                          basicNft.address,
                          TOKEN_ID,
                          NEW_PRICE)
                      })`
                  );
              });
          });

          describe("withdrawProceeds", () => {
              it("revert if no nft is bought", async () => {
                  await expect(
                      nftMarketplace.withdrawProceeds()
                  ).to.be.revertedWith("NftMarketplace__NoProceeds()");
              });

              it("a user buys an nft, owner can withdraw ETH", async () => {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  );
                  nftMarketplace = await nftMarketplace.connect(user);
                  await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                      value: PRICE,
                  });
                  nftMarketplace = await nftMarketplace.connect(deployer);
                  const deployerProceed = await nftMarketplace.getProceeds(
                      deployer.address
                  );

                  const deployerBalanceBefore = await deployer.getBalance();
                  const transactionResponse =
                      await nftMarketplace.withdrawProceeds();
                  const transactionReceipt = await transactionResponse.wait(1);
                  // gasCost
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const deployerBalanceAfter = await deployer.getBalance();

                  assert(
                      deployerBalanceAfter.add(gasCost).toString() ==
                          deployerBalanceBefore.add(deployerProceed).toString()
                  );
              });
          });
      });
