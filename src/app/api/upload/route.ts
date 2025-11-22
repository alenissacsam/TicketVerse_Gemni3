import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

// Initialize Pinata SDK
const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud",
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { error: "File must be an image" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size must be less than 5MB" },
                { status: 400 }
            );
        }

        // Upload to Pinata
        const upload = await pinata.upload.file(file);

        // Construct gateway URL
        const gatewayUrl = `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || "gateway.pinata.cloud"}/ipfs/${upload.IpfsHash}`;

        return NextResponse.json({
            success: true,
            ipfsHash: upload.IpfsHash,
            url: gatewayUrl,
        });
    } catch (error: any) {
        console.error("Error uploading to IPFS:", error);
        return NextResponse.json(
            { error: "Failed to upload image", details: error.message },
            { status: 500 }
        );
    }
}
