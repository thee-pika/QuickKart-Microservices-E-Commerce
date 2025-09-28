import React from 'react';

const StatCard = ({ title, Icon, count }: { title: string; Icon: any; count: number | string }) => {
    return (
        <div className="flex items-center justify-between bg-white shadow-md rounded-2xl p-5 hover:shadow-lg transition-shadow">
            <div>
                <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
                <Icon className="w-7 h-7 text-blue-600" />
            </div>
        </div>
    );
};

export default StatCard;