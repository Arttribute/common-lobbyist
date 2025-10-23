import hre from "hardhat";

async function main() {
  const { viem } = await hre.network.connect();

  const [deployer] = await viem.getWalletClients();

  console.log("Deployer:", deployer.account.address);

  // Deploy DAOFactory
  console.log("\nDeploying DAOFactory...");
  const factory = await viem.deployContract("DAOFactory");

  console.log("\n=== Deployment Successful ===");
  console.log("DAOFactory deployed at:", factory.address);
  console.log(
    "\nYou can now create DAOs by calling createDAO() on the factory contract."
  );
  console.log(
    "Example: factory.createDAO(name, symbol, initialSupply, metadataCid)"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
