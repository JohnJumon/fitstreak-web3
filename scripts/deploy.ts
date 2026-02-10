import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  const factory = await ethers.getContractFactory("BadgeMinter");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  // eslint-disable-next-line no-console
  console.log(`BadgeMinter deployed: ${address}`);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
