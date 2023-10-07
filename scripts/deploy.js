const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying MyToken from ${deployer.address}`);
  
  const Token = await ethers.getContractFactory("Token"); // Assuming you have a Token contract
  const token = await Token.deploy(1000000); // Deploy the Token contract with an initial supply of 1,000,000 tokens
  await token.deployed();

  console.log("Token deployed to:", token.address);

  const Crowdfunding = await ethers.getContractFactory("Crowdfunding");
  const crowdfunding = await Crowdfunding.deploy(token.address); // Pass the Token contract address to the Crowdfunding contract
  await crowdfunding.deployed();

  console.log("Crowdfunding deployed to:", crowdfunding.address);
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
