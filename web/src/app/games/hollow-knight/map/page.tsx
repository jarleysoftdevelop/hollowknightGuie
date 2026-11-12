
import MapViewer from "@/components/hollow-knight/map/MapViewer";

export default function HollowKnightMapPage() {
  return (
    <main className="min-h-screen w-full px-5 py-10 text-white sm:px-8 lg:px-10 2xl:px-14">
      <div className="w-full">
        <header className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#8bb5ce]">
            Enciclopedia de Hallownest
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Mapa interactivo
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9eb8ca]">
            Recorre Hallownest, descubre sus regiones y explora
            los secretos que esconde cada rincón del reino.
          </p>
        </header>

        <MapViewer />
      </div>
    </main>
  );
}
