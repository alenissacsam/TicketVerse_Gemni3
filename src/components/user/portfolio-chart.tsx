"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
    { name: "Jan", value: 0.5 },
    { name: "Feb", value: 0.8 },
    { name: "Mar", value: 1.2 },
    { name: "Apr", value: 1.1 },
    { name: "May", value: 1.8 },
    { name: "Jun", value: 2.4 },
];

export function PortfolioChart() {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#666"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}E`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#000", borderColor: "#333", color: "#fff" }}
                        itemStyle={{ color: "#fff" }}
                        cursor={{ stroke: "#8b5cf6", strokeWidth: 1, strokeDasharray: "5 5" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#fff" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
