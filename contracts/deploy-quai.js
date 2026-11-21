/**
 * Hardhat deployment script for TraceLockAnchor on Quai Network (Orchard Testnet / Cyprus-1 zone).
 * 
 * Usage:
 *   npx hardhat run contracts/deploy-quai.js --network orchardCyprus1
 */

const hre = require("hardhat");

async function main() {
  console.log("==================================================");
  console.log("Deploying TraceLockAnchor to Quai Network...");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer Address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account Balance:", hre.ethers.formatEther(balance), "QUAI");

  const TraceLockAnchor = await hre.ethers.getContractFactory("TraceLockAnchor");
  console.log("Submitting deployment transaction to Cyprus-1 shard...");
  
  const anchor = await TraceLockAnchor.deploy();
  await anchor.waitForDeployment();

  const contractAddress = await anchor.getAddress();
  console.log("TraceLockAnchor successfully deployed to Quai Testnet!");
  console.log("Contract Address:", contractAddress);
  console.log("Explorer URL:", `https://orchard.quaiscan.io/address/${contractAddress}`);
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
