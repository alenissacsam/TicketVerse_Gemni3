import { ethers } from "ethers";
import * as dotenv from "dotenv";
import TicketRegistryABI from "../lib/contracts/TicketRegistry.json";
import TicketFactoryABI from "../lib/contracts/TicketFactory.json";

dotenv.config();

async function deployRegistry() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  
  console.log("Deploying from:", wallet.address);
  console.log("Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH");
  
  // Deploy TicketRegistry
  console.log("\n📝 Deploying TicketRegistry...");
  const RegistryFactory = new ethers.ContractFactory(
    TicketRegistryABI.abi,
    TicketRegistryABI.bytecode,
    wallet
  );
  
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ TicketRegistry deployed at:", registryAddress);
  
  // Deploy TicketFactory
  console.log("\n🏭 Deploying TicketFactory...");
  const FactoryFactory = new ethers.ContractFactory(
    TicketFactoryABI.abi,
    TicketFactoryABI.bytecode,
    wallet
  );
  
  const usdcAddress = process.env.USDC_TOKEN_ADDRESS!;
  const factory = await FactoryFactory.deploy(registryAddress, usdcAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ TicketFactory deployed at:", factoryAddress);
  
  // Transfer registry ownership to factory
  console.log("\n🔑 Transferring registry ownership to factory...");
  const tx = await registry.transferOwnership(factoryAddress);
  await tx.wait();
  console.log("✅ Ownership transferred");
  
  console.log("\n=== 🎉 Deployment Complete ===");
  console.log("\nAdd these to your .env file:");
  console.log(`NEXT_PUBLIC_TICKET_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`NEXT_PUBLIC_TICKET_FACTORY_ADDRESS=${factoryAddress}`);
  
  console.log("\n📋 Contract Addresses:");
  console.log("Registry:", registryAddress);
  console.log("Factory:", factoryAddress);
  console.log("USDC:", usdcAddress);
}

deployRegistry()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
