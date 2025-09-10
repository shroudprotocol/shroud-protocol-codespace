import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment of Shroud Protocol...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);

  // 1. Deploy Groth16Verifier
  const verifierFactory = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await verifierFactory.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log(`✅ Groth16Verifier deployed to: ${verifierAddress}`);

  // 2. Deploy ShroudToken
  const shroudTokenFactory = await ethers.getContractFactory("ShroudToken");
  const shroudToken = await shroudTokenFactory.deploy(deployer.address);
  await shroudToken.waitForDeployment();
  const shroudTokenAddress = await shroudToken.getAddress();
  console.log(`✅ ShroudToken deployed to: ${shroudTokenAddress}`);
  
  // 3. Deploy a MockERC20 to use as a reward token for Staking
  const mockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await mockERC20Factory.deploy("Mock USDC", "mUSDC", deployer.address);
  await mockERC20.waitForDeployment();
  const mockERC20Address = await mockERC20.getAddress();
  console.log(`✅ MockERC20 (for rewards) deployed to: ${mockERC20Address}`);

  // 4. Prepare arguments for ShroudConductor
  const allowedTokens = [shroudTokenAddress]; // An array containing our token
  const allowedDenominations = [
    [
      ethers.parseEther("0.1"),
      ethers.parseEther("1"),
      ethers.parseEther("10"),
      ethers.parseEther("100"),
    ],
  ]; // A 2D array for the denominations of our token

  // 5. Deploy ShroudConductor with the CORRECT arguments
  const shroudConductorFactory = await ethers.getContractFactory("ShroudConductor");
  const shroudConductor = await shroudConductorFactory.deploy(
    verifierAddress,
    allowedTokens,
    allowedDenominations
  );
  await shroudConductor.waitForDeployment();
  console.log(`✅ ShroudConductor deployed to: ${await shroudConductor.getAddress()}`);

  // 6. Deploy Presale contract with the CORRECT arguments
  const presaleFactory = await ethers.getContractFactory("Presale");
  const saleDurationDays = 30;
  const presale = await presaleFactory.deploy(shroudTokenAddress, saleDurationDays, deployer.address);
  await presale.waitForDeployment();
  console.log(`✅ Presale deployed to: ${await presale.getAddress()}`);

  // 7. Deploy Staking contract with the CORRECT arguments
  const stakingFactory = await ethers.getContractFactory("Staking");
  const staking = await stakingFactory.deploy(shroudTokenAddress, mockERC20Address, deployer.address);
  await staking.waitForDeployment();
  console.log(`✅ Staking deployed to: ${await staking.getAddress()}`);

  console.log("\n🚀 All contracts deployed successfully! 🚀");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});