export function DashboardPage() {
    return (
        <div className="container py-12">
            <p className="text-xs tracking-widest font-bold text-[#00a982]">
                STORE CONTROL
            </p>

            <h1 className="text-4xl font-extrabold mt-2">
                Dashboard overview
            </h1>

            <p className="text-slate-500 mt-2">
                Live KPIs will appear after connecting the admin API.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {[
                    ['Revenue', '—'],
                    ['Orders', '—'],
                    ['Products', '—'],
                    ['Customers', '—']
                ].map(([k, v]) => (
                    <div className="card-soft p-6" key={k}>
                        <p className="text-sm text-slate-400">{k}</p>
                        <p className="text-3xl font-extrabold mt-2">{v}</p>
                    </div>
                ))}
            </div>

            <div className="card-soft p-8 mt-6">
                <h2 className="font-bold">Analytics are not fabricated</h2>
                <p className="text-sm text-slate-500 mt-2">
                    Connect MongoDB and the admin analytics endpoints to populate charts from real orders and products.
                </p>
            </div>
        </div>
    )
}