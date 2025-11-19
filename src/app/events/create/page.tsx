"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSmartAccountClient, useSignerStatus, useAuthModal, useAlchemyAccountContext } from "@account-kit/react";
import { getWalletClient } from "@wagmi/core";
import { createLightAccount } from "@account-kit/smart-contracts";
import { WalletClientSigner } from "@aa-sdk/core";
import { createAlchemySmartAccountClient } from "@account-kit/infra";
import { motion } from "framer-motion";
import TicketNFTArtifact from "@/lib/contracts/TicketNFT.json";
import CreateCallArtifact from "@/lib/contracts/CreateCall.json";
import { encodeDeployData, encodeFunctionData, decodeEventLog, http } from "viem";
import { sepolia } from "viem/chains";

import { config, GAS_POLICY_ID } from "@/lib/config";

export default function CreateEventPage() {
  const router = useRouter();
  const user = useUser();
  // Default client (works for embedded accounts)
  const { client: defaultClient } = useSmartAccountClient({ 
    type: "LightAccount",
    policyId: GAS_POLICY_ID,
  });
  
  // Access the internal Wagmi config from Alchemy context
  const { config: alchemyConfig } = useAlchemyAccountContext();
  const wagmiConfig = alchemyConfig._internal.wagmiConfig;

  const { isInitializing, isDisconnected, isConnected: isSCAConnected, status: signerStatus } = useSignerStatus();
  const { openAuthModal } = useAuthModal();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    venue: "",
    price: "0",
    capacity: "100",
    image: "",
  });

  // Debug logging for auth state
  useEffect(() => {
    console.log("Auth State:", { 
      user: !!user, 
      client: !!defaultClient, 
      signerStatus, 
      isInitializing, 
      isSCAConnected,
    });
  }, [user, defaultClient, signerStatus, isInitializing, isSCAConnected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("HandleSubmit called");
    console.log("Initial State:", { 
      defaultClient: !!defaultClient, 
      isSCAConnected, 
      user: !!user, 
    });

    let client = defaultClient;

    // If no default client (e.g. EOA connected), try to create one manually
    if (!client) {
      console.log("No default client. Attempting to fetch wallet client for EOA...");
      try {
        // Fetch wallet client using the config explicitly
        const walletClient = await getWalletClient(wagmiConfig);
        console.log("Fetched walletClient:", !!walletClient);
        
        if (walletClient) {
            setStatus("Initializing Smart Account for EOA...");
            const signer = new WalletClientSigner(walletClient, "json-rpc");
            const account = await createLightAccount({
              transport: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL),
              chain: sepolia,
              signer,
            });
            console.log("Created LightAccount:", account.address);
            
            client = createAlchemySmartAccountClient({
              transport: http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL),
              chain: sepolia,
              account,
              policyId: GAS_POLICY_ID,
            });
            console.log("Created manual smart account client:", client);
        } else {
            console.log("No wallet client found.");
        }
      } catch (err) {
        console.error("Failed to create manual client:", err);
        setStatus("Error initializing smart account. Please try refreshing.");
        return;
      }
    }

    if (!client) {
      console.log("No client found (and could not create manual one), opening auth modal");
      openAuthModal();
      return;
    }

    setIsLoading(true);
    setStatus("Deploying TicketNFT contract...");

    try {
      // 1. Deploy Contract via Factory (Safe CreateCall)
      // Mock URI for now - in production this would be an IPFS hash of the event metadata
      const uri = "https://ipfs.io/ipfs/QmPlaceholder";
      const createCallAddress = "0x9b35Af71d77eaf8d7e40252370304687390A1A52"; // Sepolia

      // Encode the init code for TicketNFT
      const deployData = encodeDeployData({
        abi: TicketNFTArtifact.abi,
        bytecode: TicketNFTArtifact.bytecode.object as `0x${string}`,
        args: [uri],
      });

      // Encode the call to performCreate
      const factoryData = encodeFunctionData({
        abi: CreateCallArtifact.abi,
        functionName: "performCreate",
        args: [BigInt(0), deployData],
      });

      const txHash = await client.sendTransaction({
        to: createCallAddress,
        data: factoryData,
        chain: null,
      });

      setStatus(`Transaction sent! Hash: ${txHash}. Waiting for confirmation...`);

      const receipt = await client.waitForTransactionReceipt({ hash: txHash });

      // Find the ContractCreation event
      let contractAddress: string | undefined;

      for (const log of receipt.logs) {
        try {
          if (log.address.toLowerCase() === createCallAddress.toLowerCase()) {
            const event = decodeEventLog({
              abi: CreateCallArtifact.abi,
              data: log.data,
              topics: log.topics,
            });
            if (event.eventName === "ContractCreation") {
              contractAddress = event.args.newContract;
              break;
            }
          }
        } catch (e) {
          // Ignore logs that don't match
        }
      }

      if (!contractAddress) {
        throw new Error("Failed to get contract address from receipt logs.");
      }

      setStatus(`Contract deployed at ${contractAddress}. Saving event...`);

      // 2. Save to Database
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contractAddress,
          walletAddress: client.account?.address || user?.address, // Use client account address if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save event to database.");
      }

      const newEvent = await response.json();
      setStatus("Event created successfully!");

      // Redirect to event page
      router.push(`/events/${newEvent.id}`);

    } catch (error: any) {
      console.error("Error creating event:", error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showAuthOverlay = isInitializing || (isDisconnected && !user);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Create New Event</h1>
          <p className="text-gray-600 mb-8">Launch your event on the blockchain in minutes.</p>

          <div className="relative">
            {/* Auth Overlay */}
            {showAuthOverlay && (
              <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                {isInitializing ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Connecting to wallet...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-gray-800 font-medium text-lg">Connect your wallet to create an event</p>
                    <button
                      onClick={openAuthModal}
                      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold shadow-lg hover:bg-purple-700 transition-colors"
                    >
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-6 bg-white/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-100 shadow-xl transition-opacity duration-300 ${showAuthOverlay ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

              {/* Event Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white/80"
                  placeholder="e.g. Summer Music Festival"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white/80"
                  placeholder="Tell people about your event..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    id="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white/80"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    required
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white/80"
                    placeholder="e.g. Central Park"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Ticket Price (USDC)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white/80"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white/80"
                  />
                </div>
              </div>

              {/* Status Message */}
              {status && (
                <div className={`p-4 rounded-lg text-sm ${status.includes("Error") ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                  {status}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Create Event"
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
