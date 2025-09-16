import { ethers, run } from "hardhat";

async function main() {
  console.log("--- STARTING DEFINITIVE DEPLOYMENT ---");
  await run('compile', { force: true });
  console.log("Compilation complete.");

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  const verifier = await ethers.deployContract("Groth16Verifier");
  await verifier.waitForDeployment();
  console.log(`✅ Groth16Verifier deployed to: ${verifier.target}`);

  const shroudToken = await ethers.deployContract("ShroudToken", [deployer.address]);
  await shroudToken.waitForDeployment();
  console.log(`✅ ShroudToken deployed to: ${shroudToken.target}`);
  
  const mockERC20 = await ethers.deployContract("MockERC20", ["Mock USDC", "mUSDC", deployer.address]);
  await mockERC20.waitForDeployment();
  console.log(`✅ MockERC20 deployed to: ${mockERC20.target}`);

  const allowedTokens = [
    "0x0000000000000000000000000000000000000000", // ETH
    shroudToken.target 
  ];
  const allowedDenominations = [
    [ ethers.parseEther("0.1"), ethers.parseEther("1"), ethers.parseEther("10"), ethers.parseEther("100") ],
    [ ethers.parseEther("100"), ethers.parseEther("1000"), ethers.parseEther("10000") ]
  ];

  const shroudConductor = await ethers.deployContract("ShroudConductor", [
    verifier.target,
    allowedTokens,
    allowedDenominations
  ]);
  await shroudConductor.waitForDeployment();
  console.log(`✅ ShroudConductor deployed to: ${shroudConductor.target}`);

  const presale = await ethers.deployContract("Presale", [shroudToken.target, 30, deployer.address]);
  await presale.waitForDeployment();
  console.log(`✅ Presale deployed to: ${presale.target}`);

  const staking = await ethers.deployContract("Staking", [shroudToken.target, mockERC20.target, deployer.address]);
  await staking.waitForDeployment();
  console.log(`✅ Staking deployed to: ${staking.target}`);

  console.log("\n--- DEFINITIVE DEPLOYMENT COMPLETE ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
