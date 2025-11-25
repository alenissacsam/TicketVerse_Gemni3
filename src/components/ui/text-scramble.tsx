"use client";

import { useEffect, useRef, useState } from "react";

interface TextScrambleProps {
    text: string;
    className?: string;
    onComplete?: () => void;
    duration?: number;
    speed?: number;
}

export function TextScramble({
    text,
    className,
    onComplete,
    duration = 1000,
    speed = 50
}: TextScrambleProps) {
    const [displayText, setDisplayText] = useState("");
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    const frameRequest = useRef<number>(0);
    const frame = useRef(0);
    const queue = useRef<{ from: string; to: string; start: number; end: number; char?: string }[]>([]);

    useEffect(() => {
        let mounted = true;
        const length = text.length;
        const newQueue = [];

        for (let i = 0; i < length; i++) {
            const from = displayText[i] || "";
            const to = text[i];
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            newQueue.push({ from, to, start, end });
        }

        queue.current = newQueue;
        frame.current = 0;

        const update = () => {
            if (!mounted) return;

            let output = "";
            let complete = 0;

            for (let i = 0, n = queue.current.length; i < n; i++) {
                let { from, to, start, end, char } = queue.current[i];

                if (frame.current >= end) {
                    complete++;
                    output += to;
                } else if (frame.current >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = chars[Math.floor(Math.random() * chars.length)];
                        queue.current[i].char = char;
                    }
                    output += `<span class="opacity-50">${char}</span>`;
                } else {
                    output += from;
                }
            }

            setDisplayText(output);

            if (complete === queue.current.length) {
                if (onComplete) onComplete();
            } else {
                frame.current++;
                frameRequest.current = requestAnimationFrame(update);
            }
        };

        update();

        return () => {
            mounted = false;
            cancelAnimationFrame(frameRequest.current);
        };
    }, [text]);

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: displayText }}
        />
    );
}
