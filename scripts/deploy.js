const hre = require("hardhat");

async function main() {
  console.log("Deploying SupplyChain contract...");
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  
  const address = await supplyChain.getAddress();
  console.log(`\n==================================================`);
  console.log(`✅ SupplyChain contract successfully deployed!`);
  console.log(`📍 Contract Address: ${address}`);
  console.log(`==================================================\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
