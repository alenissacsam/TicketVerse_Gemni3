"use client";

import { useState } from "react";
import { encodeFunctionData, parseEther, decodeEventLog, createWalletClient, createPublicClient, custom, http } from "viem";
import { sepolia } from "@account-kit/infra";
import { GAS_POLICY_ID, EVENT_FACTORY_ADDRESS, EventFactoryABI } from "@/lib/config";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Loader2 } from "lucide-react";

const MOCK_EVENTS = [
  {
    title: "Neon Nights Festival",
    description: "An electrifying night of synthwave and cyberpunk aesthetics.",
    date: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
    location: "Cyber City Arena",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    tiers: [
      { name: "General Admission", price: "0.05", capacity: "400" },
      { name: "VIP", price: "0.15", capacity: "100" }
    ]
  },
  {
    title: "Future Tech Summit",
    description: "Explore the latest in AI, Blockchain, and Quantum Computing.",
    date: new Date(Date.now() + 86400000 * 60).toISOString(), // 60 days from now
    location: "Silicon Valley Convention Center",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    tiers: [
      { name: "Standard Pass", price: "0.1", capacity: "150" },
      { name: "Executive Access", price: "0.5", capacity: "50" }
    ]
  },
  {
    title: "Abstract Art Gala",
    description: "A showcase of modern abstract art from around the globe.",
    date: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days from now
    location: "Metropolitan Gallery",
    image: "https://images.unsplash.com/photo-1545989253-02cc26577f88?w=800&q=80",
    tiers: [
      { name: "Entry", price: "0.02", capacity: "80" },
      { name: "Collector's Preview", price: "0.08", capacity: "20" }
    ]
  },
  {
    title: "Crypto Conference 2025",
    description: "The premier blockchain and Web3 conference featuring industry leaders and groundbreaking projects.",
    date: new Date(Date.now() + 86400000 * 45).toISOString(), // 45 days from now
    location: "Blockchain Tower, Dubai",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    tiers: [
      { name: "Developer Pass", price: "0.08", capacity: "300" },
      { name: "Investor VIP", price: "0.25", capacity: "75" }
    ]
  },
  {
    title: "Jazz Under the Stars",
    description: "An enchanting evening of smooth jazz performed by world-renowned artists under the open sky.",
    date: new Date(Date.now() + 86400000 * 20).toISOString(), // 20 days from now
    location: "Riverside Amphitheater",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80",
    tiers: [
      { name: "Lawn Seating", price: "0.03", capacity: "500" },
      { name: "Premium Seating", price: "0.12", capacity: "150" }
    ]
  },
  {
    title: "Digital Art Expo",
    description: "Experience the cutting edge of digital and NFT art from emerging and established creators.",
    date: new Date(Date.now() + 86400000 * 35).toISOString(), // 35 days from now
    location: "Modern Art Museum",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80",
    tiers: [
      { name: "Gallery Pass", price: "0.04", capacity: "200" },
      { name: "Creator's Circle", price: "0.18", capacity: "60" }
    ]
  },
  {
    title: "Food & Wine Festival",
    description: "Indulge in exquisite culinary creations and premium wines from acclaimed chefs and vineyards.",
    date: new Date(Date.now() + 86400000 * 50).toISOString(), // 50 days from now
    location: "Coastal Gardens",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
    tiers: [
      { name: "Tasting Pass", price: "0.06", capacity: "350" },
      { name: "Chef's Table", price: "0.22", capacity: "40" }
    ]
  },
  {
    title: "Startup Pitch Night",
    description: "Watch innovative startups pitch to top investors and network with the entrepreneurial community.",
    date: new Date(Date.now() + 86400000 * 25).toISOString(), // 25 days from now
    location: "Innovation Hub",
    image: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800&q=80",
    tiers: [
      { name: "Attendee", price: "0.02", capacity: "250" },
      { name: "Investor Access", price: "0.15", capacity: "80" }
    ]
  },
];


export default function SeedPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const seedEvents = async () => {
    setIsSeeding(true);
    addLog("Starting seed process...");

    try {
      // Request wallet connection directly
      addLog("Connecting to wallet...");

      if (!(window as any).ethereum) {
        throw new Error("Please install MetaMask or another Web3 wallet");
      }

      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet accounts found");
      }

      const account = accounts[0] as `0x${string}`;
      addLog(`Using wallet: ${account}`);

      // Create wallet client for direct EOA interaction
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom((window as any).ethereum),
      });

      for (const event of MOCK_EVENTS) {
        try {
          addLog(`Processing: ${event.title}...`);

          const processedTiers = [];
          const dbTiers = [];

          for (const tier of event.tiers) {
            addLog(`Uploading metadata for tier: ${tier.name}...`);

            const metadata = {
              name: `${event.title} - ${tier.name}`,
              description: event.description,
              image: event.image,
              attributes: [
                { trait_type: "Event", value: event.title },
                { trait_type: "Venue", value: event.location },
                { trait_type: "Date", value: event.date },
                { trait_type: "Ticket Type", value: tier.name }
              ]
            };

            const metadataRes = await fetch("/api/admin/ipfs-upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(metadata),
            });

            if (!metadataRes.ok) {
              const errorData = await metadataRes.json().catch(() => ({ error: 'Unknown error' }));
              addLog(`API Error: ${JSON.stringify(errorData)}`);
              throw new Error(`Failed to upload metadata for ${tier.name}: ${errorData.error || 'Unknown error'}`);
            }
            const metadataData = await metadataRes.json();
            const metadataUri = `ipfs://${metadataData.ipfsHash}`;
            addLog(`Metadata uploaded: ${metadataUri}`);

            processedTiers.push({
              name: tier.name,
              price: parseEther(tier.price),
              supply: BigInt(tier.capacity),
              minted: BigInt(0),
              metadataUri: metadataUri
            });

            dbTiers.push({
              name: tier.name,
              price: parseFloat(tier.price),
              capacity: parseInt(tier.capacity),
              metadataUri: metadataUri,
              imageUrl: event.image // Using event image for now
            });
          }

          // 2. Deploy Contract
          addLog(`Deploying contract...`);

          const symbol = event.title.substring(0, 3).toUpperCase();
          const eventId = BigInt(Date.now()); // Simple ID generation
          const eventDate = BigInt(Math.floor(new Date(event.date).getTime() / 1000));

          const data = encodeFunctionData({
            abi: EventFactoryABI,
            functionName: "deployEvent",
            args: [
              event.title,
              symbol,
              eventId,
              eventDate,
              processedTiers
            ]
          });

          const txHash = await walletClient.writeContract({
            address: EVENT_FACTORY_ADDRESS,
            abi: EventFactoryABI,
            functionName: "deployEvent",
            args: [
              event.title,
              symbol,
              eventId,
              eventDate,
              processedTiers
            ],
            value: parseEther("0.001"), // Creation fee
            account,
          });

          addLog(`Tx sent: ${txHash}. Waiting for receipt...`);

          const publicClient = createPublicClient({
            chain: sepolia,
            transport: http(),
          });

          const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

          let contractAddress: string | undefined;
          for (const log of receipt.logs) {
            try {
              if (log.address.toLowerCase() === EVENT_FACTORY_ADDRESS.toLowerCase()) {
                const decoded = decodeEventLog({
                  abi: EventFactoryABI,
                  data: log.data,
                  topics: log.topics,
                });
                if (decoded.eventName === "EventDeployed") {
                  contractAddress = ((decoded.args as unknown) as { eventContract: string }).eventContract;
                  break;
                }
              }
            } catch (e) { /* ignore */ }
          }

          if (!contractAddress) throw new Error("Failed to get contract address");
          addLog(`Contract deployed at: ${contractAddress}`);

          // 3. Save to DB
          addLog(`Saving to database...`);
          const response = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: event.title,
              description: event.description,
              date: event.date,
              venue: event.location,
              image: event.image,
              contractAddress,
              walletAddress: account,
              ticketTypes: dbTiers,
            }),
          });

          if (!response.ok) throw new Error("Failed to save to DB");
          addLog(`Successfully created: ${event.title}`);

        } catch (error: any) {
          console.error(error);
          addLog(`Error creating ${event.title}: ${error.message}`);
        }
      }

      addLog("Seeding complete!");
    } catch (error: any) {
      addLog(`❌ Critical error: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6 bg-[#fcfcfc] relative">
      <GridPattern className="absolute inset-0 opacity-[0.03]" />
      <div className="max-w-2xl mx-auto relative z-10">
        <h1 className="text-3xl font-serif font-bold mb-6">Seed Mock Events</h1>
        <p className="mb-8 text-slate-600">
          This tool will deploy 8 mock events using your connected wallet.
          It will upload metadata to IPFS and deploy contracts via the Factory.
          Please ensure you have enough Sepolia ETH.
        </p>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
          <h3 className="font-bold mb-4">Status Log</h3>
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs">
            {logs.length === 0 ? "Ready to start..." : logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </div>

        <button
          onClick={seedEvents}
          disabled={isSeeding}
          className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSeeding ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Seeding...
            </>
          ) : (
            "Deploy Mock Events"
          )}
        </button>
      </div>
    </div>
  );
}
