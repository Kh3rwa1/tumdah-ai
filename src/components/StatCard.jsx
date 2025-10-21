import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, change, trend, icon: Icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-emerald-500 to-emerald-600',
        purple: 'from-violet-500 to-violet-600',
        orange: 'from-orange-500 to-orange-600',
        pink: 'from-pink-500 to-pink-600',
    };

    const isPositive = trend === 'up';

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {change}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-500">{title}</p>
                <p className="text-3xl font-bold text-neutral-900">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
