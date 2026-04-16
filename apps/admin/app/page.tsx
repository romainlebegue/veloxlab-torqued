export default function AdminHome() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Listings actifs",  value: "—", href: "/listings" },
          { label: "Scrapers jobs",    value: "—", href: "/scrapers" },
          { label: "Sources actives",  value: "8", href: "/sellers" },
        ].map(({ label, value, href }) => (
          <a
            key={label}
            href={href}
            className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
          >
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </a>
        ))}
      </div>
      <p className="mt-8 text-sm text-gray-400">
        Connectez Supabase pour voir les données en temps réel.
      </p>
    </div>
  );
}
