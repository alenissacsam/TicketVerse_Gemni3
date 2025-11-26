"use client";

import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { PropsWithChildren, useState } from "react";
import { AlchemyClientState } from "@account-kit/core";

export const Providers = (props: PropsWithChildren<{ initialState?: AlchemyClientState }>) => {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <AlchemyAccountProvider config={config} queryClient={queryClient} initialState={props.initialState}>
                {props.children}
            </AlchemyAccountProvider>
        </QueryClientProvider>
    );
};
