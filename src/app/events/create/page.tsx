"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSmartAccountClient, useSignerStatus, useAuthModal, useAlchemyAccountContext } from "@account-kit/react";
import { getWalletClient } from "@wagmi/core";
import { createLightAccount } from "@account-kit/smart-contracts";
import { WalletClientSigner } from "@aa-sdk/core";
import { createAlchemySmartAccountClient, alchemy, sepolia } from "@account-kit/infra";
import { motion, AnimatePresence } from "framer-motion";
import { encodeFunctionData, decodeEventLog, parseEther } from "viem";
import { Loader2, Upload, X, Calendar, MapPin, DollarSign, Users, Wallet, Plus, Trash2 } from "lucide-react";

import { GAS_POLICY_ID, EVENT_FACTORY_ADDRESS, EventFactoryABI } from "@/lib/config";

interface TicketTier {
  id: string;
  name: string;
  price: string;
  capacity: string;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function CreateEventPage() {
  const router = useRouter();
  const user = useUser();
  const { client: defaultClient } = useSmartAccountClient({
    type: "LightAccount",
    policyId: GAS_POLICY_ID,
  });

  const { config: alchemyConfig } = useAlchemyAccountContext();
  const wagmiConfig = alchemyConfig._internal.wagmiConfig;
  const { isInitializing, isDisconnected, status: signerStatus } = useSignerStatus();
  const { openAuthModal } = useAuthModal();

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Event Details
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    venue: "",
  });

  // Ticket Tiers
  const [tiers, setTiers] = useState<TicketTier[]>([
    { id: "1", name: "General Admission", price: "0", capacity: "100", imageFile: null, imagePreview: null }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEventImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addTier = () => {
    setTiers(prev => [
      ...prev,
      { id: Math.random().toString(), name: "", price: "0", capacity: "100", imageFile: null, imagePreview: null }
    ]);
  };

  const removeTier = (id: string) => {
    if (tiers.length > 1) {
      setTiers(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTier = (id: string, field: keyof TicketTier, value: any) => {
    setTiers(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleTierImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTiers(prev => prev.map(t => {
          if (t.id === id) {
            return { ...t, imageFile: file, imagePreview: reader.result as string };
          }
          return t;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: uploadFormData });
    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let client: any = defaultClient;

    if (!client) {
      try {
        const walletClient = await getWalletClient(wagmiConfig);
        if (walletClient) {
          setStatus("Initializing Smart Account for EOA...");
          const signer = new WalletClientSigner(walletClient, "json-rpc");
          const account = await createLightAccount({
            transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
            chain: sepolia,
            signer,
          });
          client = createAlchemySmartAccountClient({
            transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
            chain: sepolia,
            account,
            policyId: GAS_POLICY_ID,
          });
        }
      } catch (err) {
        console.error("Failed to create manual client:", err);
        setStatus("Error initializing smart account.");
        return;
      }
    }

    if (!client) {
      openAuthModal();
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload Event Cover Image
      let eventImageUrl = "";
      if (eventImageFile) {
        setStatus("Uploading event cover image...");
        eventImageUrl = await uploadToIPFS(eventImageFile);
      }

      // 2. Process Tiers (Upload Images & Metadata)
      const processedTiers = [];
      const dbTiers = [];

      for (const tier of tiers) {
        setStatus(`Processing tier: ${tier.name}...`);

        let tierImageUrl = eventImageUrl; // Default to event image if no tier image
        if (tier.imageFile) {
          tierImageUrl = await uploadToIPFS(tier.imageFile);
        }

        // Upload Metadata
        const metadata = {
          name: `${formData.name} - ${tier.name}`,
          description: formData.description,
          image: tierImageUrl,
          attributes: [
            { trait_type: "Event", value: formData.name },
            { trait_type: "Venue", value: formData.venue },
            { trait_type: "Date", value: formData.date },
            { trait_type: "Ticket Type", value: tier.name }
          ]
        };

        const metadataRes = await fetch("/api/admin/ipfs-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(metadata),
        });

        if (!metadataRes.ok) throw new Error(`Failed to upload metadata for ${tier.name}`);
        const metadataData = await metadataRes.json();
        const metadataUri = `ipfs://${metadataData.ipfsHash}`;

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
          imageUrl: tierImageUrl
        });
      }

      // 3. Deploy Contract
      setStatus("Deploying Event Contract...");
      const symbol = formData.name.substring(0, 3).toUpperCase();
      const eventDate = BigInt(Math.floor(new Date(formData.date).getTime() / 1000));
      const eventId = BigInt(Date.now()); // Simple ID generation

      const data = encodeFunctionData({
        abi: EventFactoryABI,
        functionName: "deployEvent",
        args: [
          formData.name,
          symbol,
          eventId,
          eventDate,
          processedTiers
        ]
      });

      const txHash = await client.sendTransaction({
        to: EVENT_FACTORY_ADDRESS,
        data: data,
        value: parseEther("0.01"), // Creation fee
        chain: null,
      });

      setStatus(`Transaction sent! Hash: ${txHash}. Waiting for confirmation...`);
      const receipt = await client.waitForTransactionReceipt({ hash: txHash });

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

      if (!contractAddress) throw new Error("Failed to get deployed contract address.");

      setStatus(`Contract deployed at ${contractAddress}. Saving event...`);

      // 4. Save to Database
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          date: formData.date,
          venue: formData.venue,
          image: eventImageUrl,
          contractAddress,
          walletAddress: client.account?.address || user?.address,
          ticketTypes: dbTiers
        }),
      });

      if (!response.ok) throw new Error("Failed to save event to database.");

      const newEvent = await response.json();
      setStatus("Event created successfully!");
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
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bungee text-white mb-4 tracking-tight">Create Event</h1>
          <p className="text-zinc-400 text-lg">Launch your multi-tier event on the blockchain.</p>
        </div>

        <div className="relative">
          <AnimatePresence>
            {showAuthOverlay && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                <button onClick={openAuthModal} className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-all">
                  Connect Wallet
                </button>
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className={`space-y-8 bg-zinc-900/30 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 ${showAuthOverlay ? 'opacity-20' : 'opacity-100'}`}>

            {/* Event Details Section */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Event Details</h3>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase">Event Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white"
                  placeholder="e.g. Cyberpunk Rave 2077"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white resize-none"
                  placeholder="Event description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase">Date & Time</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-black/50 border border-white/10 text-white [&::-webkit-calendar-picker-indicator]:invert"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase">Venue</label>
                  <div className="relative">
                    <input
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-black/50 border border-white/10 text-white"
                      placeholder="e.g. Metaverse"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase">Event Cover Image</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 bg-black/50 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden group">
                    {eventImagePreview ? (
                      <img src={eventImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-zinc-500" />
                    )}
                    <input type="file" accept="image/*" onChange={handleEventImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <div className="text-sm text-zinc-400">
                    <p>Upload a cover image for the event page.</p>
                    <p className="text-xs text-zinc-600">Recommended: 16:9 aspect ratio</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Tiers Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xl font-bold text-white">Ticket Tiers</h3>
                <button type="button" onClick={addTier} className="flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300">
                  <Plus className="w-4 h-4" /> Add Tier
                </button>
              </div>

              <div className="space-y-4">
                {tiers.map((tier, index) => (
                  <div key={tier.id} className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4 relative group">
                    {tiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(tier.id)}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Tier Name</label>
                        <input
                          value={tier.name}
                          onChange={(e) => updateTier(tier.id, "name", e.target.value)}
                          placeholder="e.g. VIP"
                          className="w-full px-4 py-2 rounded-lg bg-black/50 border border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">NFT Image (Optional)</label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
                            {tier.imagePreview ? (
                              <img src={tier.imagePreview} alt="NFT" className="w-full h-full object-cover" />
                            ) : (
                              <Upload className="w-4 h-4 text-zinc-500" />
                            )}
                            <input type="file" accept="image/*" onChange={(e) => handleTierImageChange(tier.id, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                          <span className="text-xs text-zinc-500">Different image for this tier?</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Price (USDC)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) => updateTier(tier.id, "price", e.target.value)}
                            className="w-full px-4 py-2 pl-8 rounded-lg bg-black/50 border border-white/10 text-white"
                          />
                          <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-zinc-500 uppercase">Supply</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={tier.capacity}
                            onChange={(e) => updateTier(tier.id, "capacity", e.target.value)}
                            className="w-full px-4 py-2 pl-8 rounded-lg bg-black/50 border border-white/10 text-white"
                          />
                          <Users className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status & Submit */}
            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${status.includes("Error") ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}
                >
                  {status}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-white text-black font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" /> Processing...
                </span>
              ) : (
                "Deploy Event"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
