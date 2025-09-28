import { Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

const OrdersTable = ({ orders, isLoading }: {
    orders: any[],
    isLoading: boolean;
}) => {

    const columns = useMemo(
        () => [
            { key: "id", label: "Order ID" },
            { key: "user?.name", label: "Buyer" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" },
        ],
        []
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="animate-spin mr-2" /> Loading orders...
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#D1E1D8] border border-gray-300 shadow-sm min-h-screen">

            <div className="overflow-x-auto ">
                <table className="w-full border-collapse rounded-lg overflow-hidden">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm text-gray-700">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="p-3 border-b bg-[#096D48] text-white border-gray-200 font-medium"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="p-6 text-center text-gray-500"
                                >
                                    No orders found
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: any, idx: number) => (
                                <tr
                                    key={order.id}
                                    className={`transition ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                        } hover:bg-gray-100`}
                                >
                                    <td className="p-3 border-b border-gray-200">
                                        #{order.id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        {order.user?.name || "N/A"}
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === "completed"
                                                ? "bg-green-100 text-green-700"
                                                : order.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-3 border-b border-gray-200">
                                        <Link href={`/order/${order.id}`}>
                                            <button className="flex items-center text-blue-600 hover:text-blue-800 transition">
                                                <Eye className="w-4 h-4 mr-1" /> View
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OrdersTable;