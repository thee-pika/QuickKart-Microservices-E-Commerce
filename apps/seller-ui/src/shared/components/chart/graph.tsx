"use client"

import {
    AreaChart,
    Area,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"

const areaData = [
    { month: "Jan", visitors: 400 },
    { month: "Feb", visitors: 300 },
    { month: "Mar", visitors: 200 },
    { month: "Apr", visitors: 278 },
    { month: "May", visitors: 189 },
    { month: "Jun", visitors: 239 },
    { month: "Jul", visitors: 349 },
]

const pieData = [
    { name: "Desktop", value: 400 },
    { name: "Mobile", value: 300 },
    { name: "Tablet", value: 300 },
    { name: "Others", value: 200 },
]

const COLORS = ["#7C3AED", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6"];

export default function ChartAreaDefault() {
    return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-black via-purple-950 to-black rounded-2xl shadow-lg">
      
            <div className="bg-gradient-to-br from-gray-900 via-black to-purple-950 p-5 rounded-2xl shadow-md h-[350px] border border-purple-800/40">
                <h2 className="text-lg font-semibold mb-4 text-purple-300">Visitors Over Time</h2>
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                        <XAxis dataKey="month" stroke="#9CA3AF" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1f1f1f",
                                border: "1px solid #7C3AED",
                                borderRadius: "0.5rem",
                                color: "#fff",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="visitors"
                            stroke="#9333EA"
                            strokeWidth={2}
                            fill="url(#colorVisitors)"
                        />
                        <defs>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9333EA" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#9333EA" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </div>

     
            <div className="bg-gradient-to-br from-gray-900 via-black to-purple-950 p-5 rounded-2xl shadow-md min-h-[350px] border border-purple-800/40 flex flex-col">
         
                <h2 className="text-lg font-semibold mb-2 text-purple-300">
                    Traffic Sources
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    How visitors are reaching your shop
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center flex-1">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1f1f1f",
                                    border: "1px solid #7C3AED",
                                    borderRadius: "0.5rem",
                                    color: "#fff",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 md:mt-0 md:ml-6 w-full md:w-auto flex flex-wrap gap-3 justify-center">
                        {pieData.map((entry, index) => (
                            <div
                                key={entry.name}
                                className="flex items-center gap-2 text-sm text-gray-300"
                            >
                                <span
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}
