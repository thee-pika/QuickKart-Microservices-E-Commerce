"use client";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

type LogType = "info" | "error" | "warning" | "success" | "debug";

type LogItem = {
    type: LogType;
    message: string;
    timeStamp: string;
    source?: string;
};

const typeColorMap: Record<LogType, string> = {
    info: "text-blue-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    success: "text-green-400",
    debug: "text-purple-400",
};

const Page = () => {
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([]);
    const [activeFilter, setActiveFilter] = useState<LogType | "all">("all");
    const logContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URI!);

        socket.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                setLogs((prev) => [...prev, parsed]);
            } catch (error) {
           
            }
        };

        return () => socket.close();
    }, []);

    useEffect(() => {
        setFilteredLogs(
            activeFilter === "all" ? logs : logs.filter((log) => log.type === activeFilter)
        );
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, activeFilter]);

    const downloadLogs = () => {
        const content = filteredLogs
            .map(
                (log) =>
                    `[${new Date(log.timeStamp).toLocaleTimeString()}] ${log.source || "SYSTEM"
                    } [${log.type.toUpperCase()}] ${log.message}`
            )
            .join("\n");

        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "application-logs.log";
        a.click();
        URL.revokeObjectURL(url);
    };

    const filterButtons: (LogType | "all")[] = ["all", "info", "success", "warning", "error", "debug"];

    return (
        <div className="p-6 bg-gray-900 text-white h-screen flex flex-col">

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">📜 Application Logs</h2>
                <button
                    onClick={downloadLogs}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                    <Download size={18} /> Download Logs
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {filterButtons.map((btn) => (
                    <button
                        key={btn}
                        onClick={() => setActiveFilter(btn)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold border ${activeFilter === btn
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-600 hover:bg-gray-700"
                            }`}
                    >
                        {btn.toUpperCase()}
                    </button>
                ))}
            </div>

            <div
                ref={logContainerRef}
                className="flex-1 overflow-y-auto rounded-lg bg-gray-800 p-4 space-y-2 shadow-inner"
            >
                {filteredLogs.length === 0 ? (
                    <p className="text-gray-400 text-center italic">Waiting for logs…</p>
                ) : (
                    filteredLogs.map((log, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-3 border-b border-gray-700 pb-2 last:border-none"
                        >
                            <span className="text-xs text-gray-500 w-20 shrink-0">
                                {new Date(log.timeStamp).toLocaleTimeString()}
                            </span>
                            <span className={`font-semibold ${typeColorMap[log.type]} shrink-0`}>
                                [{log.type.toUpperCase()}]
                            </span>
                            <span className="text-gray-300">{log.source || "SYSTEM"}:</span>
                            <span className="text-gray-100">{log.message}</span>
                        </div>
                    ))
                )}
            </div>

            <div className="text-gray-500 text-xs mt-2 text-center">
                Press <kbd className="px-1 bg-gray-700 rounded">1</kbd> for Errors,{" "}
                <kbd className="px-1 bg-gray-700 rounded">2</kbd> for Success,{" "}
                <kbd className="px-1 bg-gray-700 rounded">0</kbd> for All.
            </div>
        </div>
    );
};

export default Page;
