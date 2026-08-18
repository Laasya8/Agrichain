const hre = require("hardhat");

async function main() {
  console.log("🔍 Testing Live Sepolia Blockchain Storage...\n");

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  console.log("📍 Target Contract Address:", contractAddress);

  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Contract address not set in .env.local!");
    process.exit(1);
  }

  // Get signer from PRIVATE_KEY
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Interacting with Wallet Address:", signer.address);

  // Attach to deployed SupplyChain contract
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const contract = SupplyChain.attach(contractAddress);

  // Generate test batch ID and hash
  const testBatchId = "TEST-BATCH-" + Date.now();
  const sampleBatchData = {
    batchId: testBatchId,
    cropName: "Organic Wheat",
    location: "Farm-101",
    quantity: 500
  };
  const testHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(JSON.stringify(sampleBatchData)));

  console.log(`\n📦 Storing Record on Sepolia Blockchain...`);
  console.log(`   Batch ID : ${testBatchId}`);
  console.log(`   Hash     : ${testHash}`);

  // Send transaction to blockchain
  const tx = await contract.anchorRecord(testBatchId, testHash);
  console.log(`⏳ Transaction Sent! TX Hash: ${tx.hash}`);
  console.log(`   Waiting for block confirmation...`);

  await tx.wait();
  console.log(`\n✅ Transaction Confirmed on Sepolia Blockchain!`);

  // Now read it back from the blockchain
  console.log(`\n📖 Reading Record back from Sepolia Blockchain...`);
  const record = await contract.getRecord(testBatchId);

  console.log(`\n==================================================`);
  console.log(`🎉 BLOCKCHAIN VERIFICATION RESULT:`);
  console.log(`   Stored Hash     : ${record.hash}`);
  console.log(`   Stored Timestamp: ${new Date(Number(record.timestamp) * 1000).toLocaleString()}`);
  console.log(`   Stored Sender   : ${record.sender}`);
  console.log(`   Match Check     : ${record.hash === testHash ? "✅ MATCHES EXACTLY!" : "❌ MISMATCH!"}`);
  console.log(`==================================================\n`);
}

main().catch((error) => {
  console.error("❌ Test Failed:", error);
  process.exitCode = 1;
});
