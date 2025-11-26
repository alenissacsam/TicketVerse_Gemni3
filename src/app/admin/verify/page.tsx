"use client";

import { useState } from "react";
import { useSmartAccountClient, useUser } from "@account-kit/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { USER_VERIFICATION_ADDRESS, UserVerificationABI } from "@/lib/config";
import { encodeFunctionData } from "viem";
import { Loader2 } from "lucide-react";

export default function AdminVerifyPage() {
  const user = useUser();
  const { client } = useSmartAccountClient({ type: "LightAccount" });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userAddress: "",
    level: "1",
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !user) {
      alert("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      // function verifyUser(address user, uint256 level) external
      const data = encodeFunctionData({
        abi: UserVerificationABI,
        functionName: "verifyUser",
        args: [formData.userAddress as `0x${string}`, BigInt(formData.level)]
      });

      const hash = await client.sendTransaction({
        to: USER_VERIFICATION_ADDRESS,
        data,
        chain: null
      });

      await client.waitForTransactionReceipt({ hash });
      
      alert("User verified successfully");
      setFormData({ userAddress: "", level: "1" });
    } catch (error: any) {
      alert(`Failed to verify user: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Verify User</h1>
        <p className="text-muted-foreground">
          Set KYC level for a user address.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            Enter the wallet address and verification level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="address">User Wallet Address</Label>
              <Input
                id="address"
                placeholder="0x..."
                value={formData.userAddress}
                onChange={(e) => setFormData({ ...formData, userAddress: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="level">KYC Level</Label>
              <Input
                id="level"
                type="number"
                min="0"
                max="3"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                0: None, 1: Basic, 2: Advanced, 3: VIP
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !client}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify User"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
