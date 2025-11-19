"use client";

import { useEffect, useRef, useState } from "react";
import UnicornScene from "unicornstudio-react";

interface UnicornEmbedProps {
    projectId: string;
    altText?: string;
}

export function UnicornEmbed({ projectId, altText = "Interactive 3D Scene" }: UnicornEmbedProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // MutationObserver to aggressively remove the badge
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        // Check for the badge based on href or structure
                        if (
                            (node.tagName === "A" &&
                                node.getAttribute("href")?.includes("unicorn.studio")) ||
                            node.querySelector('a[href*="unicorn.studio"]') ||
                            node.classList.contains("unicorn-credit")
                        ) {
                            node.style.display = "none"; // Hide it
                            node.remove(); // Remove it
                        }
                    }
                });
            });
        });

        observer.observe(containerRef.current, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="unicorn-embed w-full h-full min-h-[600px] relative overflow-hidden rounded-xl shadow-2xl"
        >
            <UnicornScene
                projectId={projectId}
                width="100%"
                height="100%"
                scale={1}
                dpi={1.5}
                altText={altText}
            />
        </div>
    );
}
