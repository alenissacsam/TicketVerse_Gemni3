"use client";

import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { PropsWithChildren, useState } from "react";

export const Providers = (props: PropsWithChildren) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AlchemyAccountProvider config={config} queryClient={queryClient}>
                {props.children}
            </AlchemyAccountProvider>
        </QueryClientProvider>
    );
};
