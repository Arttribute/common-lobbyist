import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther, keccak256, toBytes } from "viem";

function sqrtFloor(n: bigint): bigint {
  // integer sqrt floor (for assertions)
  if (n === 0n) return 0n;
  let x = n;
  let y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + n / x) / 2n;
  }
  return x;
}

describe("Common Lobbyist Core", async function () {
  const { viem } = await network.connect();
  const [deployer, alice, bob] = await viem.getWalletClients();

  it("creates a DAO, signals and withdraws with quadratic aggregation", async () => {
    // Deploy factory
    const factory = await viem.deployContract("DAOFactory");

    // Create a DAO
    const NAME = "Commons";
    const SYMBOL = "COM";
    const INITIAL = parseEther("1000000");
    const metaCid = "bafybeigdyr...dao-meta";

    const hash = await factory.write.createDAO(
      [NAME, SYMBOL, INITIAL, metaCid],
      { account: deployer.account }
    );

    const publicClient = await viem.getPublicClient();
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Find DaoCreated event
    const logs = await publicClient.getContractEvents({
      address: factory.address,
      abi: factory.abi,
      eventName: "DaoCreated",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    const daoCreatedEvent = logs[0];
    // Event args: (address indexed daoOwner, address token, address signalRegistry, string metadataCid)
    const tokenAddr = daoCreatedEvent.args.token!;
    const registryAddr = daoCreatedEvent.args.signalRegistry!;

    const token = await viem.getContractAt("GovernanceToken", tokenAddr);
    const registry = await viem.getContractAt("SignalRegistry", registryAddr);

    // DAO owner received initial tokens
    const deployerBalance = await token.read.balanceOf([deployer.account.address]);
    assert.equal(deployerBalance, INITIAL);

    // fund alice and bob from owner
    await token.write.transfer(
      [alice.account.address, parseEther("1000")],
      { account: deployer.account }
    );
    await token.write.transfer(
      [bob.account.address, parseEther("900")],
      { account: deployer.account }
    );

    // Prepare CID
    const cid = "bafybeifooexamplecidv1string";
    const cidHash = keccak256(toBytes(cid));

    // Alice approves and signals 400
    await token.write.approve(
      [registryAddr, parseEther("400")],
      { account: alice.account }
    );
    await registry.write.signal(
      [cid, parseEther("400")],
      { account: alice.account }
    );

    // Bob approves and signals 100
    await token.write.approve(
      [registryAddr, parseEther("100")],
      { account: bob.account }
    );
    await registry.write.signal(
      [cid, parseEther("100")],
      { account: bob.account }
    );

    // Check aggregate
    const mem = await registry.read.memories([cidHash]);
    assert.equal(mem[5], true); // exists

    const totalRaw = mem[2]; // totalRaw
    assert.equal(totalRaw, parseEther("500"));

    // Quadratic: floor(sqrt(400)) + floor(sqrt(100)) in wei terms
    const aliceRaw = parseEther("400");
    const bobRaw = parseEther("100");
    const expectedQuad = sqrtFloor(aliceRaw) + sqrtFloor(bobRaw);

    assert.equal(mem[3], expectedQuad); // totalQuadWeight

    // Bob withdraws 100 fully → supporter count decreases
    await registry.write.withdraw(
      [cid, parseEther("100")],
      { account: bob.account }
    );
    const mem2 = await registry.read.memories([cidHash]);
    assert.equal(mem2[4], 1); // supporters

    // Alice withdraws 50 → still a supporter
    await registry.write.withdraw(
      [cid, parseEther("50")],
      { account: alice.account }
    );
    const posAlice = await registry.read.positions([cidHash, alice.account.address]);
    assert.equal(posAlice[0], parseEther("350")); // rawAmount
  });

  it("stores and returns CID strings cleanly", async () => {
    const [deployer, user] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();

    const factory = await viem.deployContract("DAOFactory");

    const hash = await factory.write.createDAO(["X", "X", 0n, "bafy...meta"]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const logs = await publicClient.getContractEvents({
      address: factory.address,
      abi: factory.abi,
      eventName: "DaoCreated",
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    const daoCreatedEvent = logs[0];
    // Event args: (address indexed daoOwner, address token, address signalRegistry, string metadataCid)
    const registryAddr = daoCreatedEvent.args.signalRegistry!;
    const tokenAddr = daoCreatedEvent.args.token!;

    const registry = await viem.getContractAt("SignalRegistry", registryAddr);
    const token = await viem.getContractAt("GovernanceToken", tokenAddr);

    const cid = "bafybeihumanreadablecidv1";

    // Should revert without tokens
    try {
      await registry.write.signal([cid, 1n], { account: user.account });
      assert.fail("Should have reverted");
    } catch (error: any) {
      // Expected to fail
      assert.ok(error.message.includes("transferFrom failed") || error.message.includes("revert"));
    }

    // Mint tokens and approve
    await token.write.mint([user.account.address, 1000n], { account: deployer.account });
    await token.write.approve([registryAddr, 1000n], { account: user.account });

    await registry.write.signal([cid, 1000n], { account: user.account });

    const cidHash = keccak256(toBytes(cid));
    const mem = await registry.read.memories([cidHash]);
    assert.equal(mem[0], cid); // cid
  });
});
