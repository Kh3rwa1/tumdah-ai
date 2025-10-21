const ChartCard = ({ title, subtitle, children, action }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                    {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div>{children}</div>
        </div>
    );
};

export default ChartCard;
