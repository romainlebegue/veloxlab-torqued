import { VehicleSearchBar } from "@/components/search/vehicle-search-bar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-4">
          <span className="text-lg font-bold text-blue-700 tracking-tight">
            Torqued
          </span>
          <nav className="hidden sm:flex gap-5 text-sm text-gray-500 ml-4">
            <a href="/marques/volkswagen" className="hover:text-gray-900">Marques</a>
            <a href="/categories/disques-de-frein" className="hover:text-gray-900">Catégories</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Comparez les pièces auto<br />
          <span className="text-blue-600">au meilleur prix</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Neuf, occasion, recyclé certifié · eBay, AutoDoc, Oscaro, RockAuto et plus
        </p>
        <VehicleSearchBar />
      </section>

      {/* Trust indicators */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">6+</p>
            <p className="text-sm text-gray-500 mt-1">Sources comparées</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">REC</p>
            <p className="text-sm text-gray-500 mt-1">Label recyclé certifié</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">🇫🇷🇩🇪🇬🇧🇪🇸</p>
            <p className="text-sm text-gray-500 mt-1">4 marchés européens</p>
          </div>
        </div>
      </section>
    </div>
  );
}
