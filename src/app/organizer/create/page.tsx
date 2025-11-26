"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useSmartAccountClient } from "@account-kit/react";
import { createPublicClient, http, encodeFunctionData, parseEther, decodeEventLog } from "viem";
import { sepolia } from "viem/chains";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Trash2, Upload, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_FACTORY_ADDRESS, EventFactoryABI } from "@/lib/config";

interface TicketTier {
  name: string;
  price: string;
  supply: string;
  metadataUri: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const user = useUser();
  const { client } = useSmartAccountClient({ type: "LightAccount" });

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>(new Date());
  const [eventVenue, setEventVenue] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tiers, setTiers] = useState<TicketTier[]>([
    { name: "General Admission", price: "10", supply: "100", metadataUri: "ipfs://placeholder" }
  ]);

  const handleAddTier = () => {
    setTiers([...tiers, { name: "", price: "", supply: "", metadataUri: "ipfs://placeholder" }]);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const handleTierChange = (index: number, field: keyof TicketTier, value: string) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  const handleDeploy = async () => {
    if (!client || !user || !eventDate) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Prepare Data
      const eventId = Math.floor(Date.now() / 1000); // Simple ID generation
      const eventDateUnix = Math.floor(eventDate.getTime() / 1000);

      const formattedTiers = tiers.map(tier => ({
        name: tier.name,
        price: parseEther(tier.price), // Convert to Wei (assuming price is in ETH/USDC) - Contract expects uint256
        supply: BigInt(tier.supply),
        minted: BigInt(0),
        metadataUri: tier.metadataUri
      }));

      // 2. Deploy Contract
      const deployData = encodeFunctionData({
        abi: EventFactoryABI,
        functionName: "deployEvent",
        args: [
          eventName,
          "TKT", // Symbol
          BigInt(eventId),
          BigInt(eventDateUnix),
          formattedTiers
        ]
      });

      // Note: This requires the factory to be payable and charge a fee.
      // We need to send value with the transaction.
      // Assuming 0.01 ETH fee as per contract.
      const hash = await client.sendTransaction({
        to: EVENT_FACTORY_ADDRESS,
        data: deployData,
        value: parseEther("0.01"),
        chain: null
      } as any);

      const receipt = await client.waitForTransactionReceipt({ hash });

      // Find deployed address from logs
      let deployedAddress = "0x...";

      // Parse logs to find EventDeployed
      for (const log of receipt.logs) {
        try {
          const decodedLog = decodeEventLog({
            abi: EventFactoryABI,
            data: log.data,
            topics: log.topics,
          });

          if (decodedLog.eventName === "EventDeployed" && decodedLog.args) {
            deployedAddress = (decodedLog.args as any).eventContract;
            break;
          }
        } catch (e) {
          // Ignore logs that don't match the ABI
          continue;
        }
      }

      if (deployedAddress === "0x...") {
        console.warn("Could not find EventDeployed log, using placeholder.");
      }

      // 3. Save to Database
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName,
          description: eventDescription,
          date: eventDate.toISOString(),
          venue: eventVenue,
          coverImageUrl: coverImage,
          organizerAddress: user.address,
          contractAddress: deployedAddress,
          tiers: tiers.map(t => ({ ...t, price: Number(t.price), supply: Number(t.supply) }))
        })
      });

      if (!res.ok) throw new Error("Failed to save event to database");

      router.push("/organizer/dashboard");

    } catch (err: any) {
      console.error("Deployment error:", err);
      setError(err.message || "Failed to deploy event");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-8 text-center text-white">Please login as an organizer.</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6 pb-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bungee mb-8">Create Event</h1>

        <div className="space-y-8">
          {/* Step 1: Event Details */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Basic information about your event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Name</Label>
                <Input value={eventName} onChange={(e) => setEventName(e.target.value)} className="bg-zinc-800 border-zinc-700" />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} className="bg-zinc-800 border-zinc-700" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal bg-zinc-800 border-zinc-700", !eventDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800">
                      <Calendar mode="single" selected={eventDate} onSelect={setEventDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." className="bg-zinc-800 border-zinc-700" />
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Ticket Tiers */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle>Ticket Tiers</CardTitle>
              <CardDescription>Define ticket types and pricing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tiers.map((tier, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-end border-b border-zinc-800 pb-4 last:border-0">
                  <div className="col-span-4 space-y-2">
                    <Label>Name</Label>
                    <Input value={tier.name} onChange={(e) => handleTierChange(index, "name", e.target.value)} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label>Price (ETH)</Label>
                    <Input type="number" value={tier.price} onChange={(e) => handleTierChange(index, "price", e.target.value)} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label>Supply</Label>
                    <Input type="number" value={tier.supply} onChange={(e) => handleTierChange(index, "supply", e.target.value)} className="bg-zinc-800 border-zinc-700" />
                  </div>
                  <div className="col-span-2">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveTier(index)} className="text-red-500 hover:text-red-400 hover:bg-red-950/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddTier} className="w-full border-dashed border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                <Plus className="mr-2 h-4 w-4" /> Add Ticket Tier
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Deploy */}
          <div className="flex flex-col gap-4">
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200 text-sm">
                Error: {error}
              </div>
            )}

            <Button
              size="lg"
              onClick={handleDeploy}
              disabled={loading || !eventName || !eventDate || tiers.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold text-lg h-14"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Deploying Contract...
                </>
              ) : (
                "Create Event & Deploy Contract"
              )}
            </Button>
            <p className="text-center text-xs text-zinc-500">
              This will deploy a new smart contract on Sepolia. Estimated cost: 0.01 ETH + Gas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
