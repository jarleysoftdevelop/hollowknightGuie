
"use client";

import type { Charm } from "@/services/charms.service";
import CharmIcon from "./CharmIcon";
import type { ReactNode } from "react";

interface CharmDetailsProps {
  charm: Charm;
  obtained: boolean;
  saving: boolean;
  onClose: () => void;
  onToggle: (charm: Charm, obtained: boolean) => void;
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#344b5b] bg-[#14232e]/80 p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#a8d2e7]">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function CharmDetails({
  charm,
  obtained,
  saving,
  onClose,
  onToggle,
}: CharmDetailsProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="charm-title"
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#496174] bg-[#0d1923] shadow-2xl"
      >
        {/* Encabezado */}
        <div className="relative overflow-hidden border-b border-[#344b5b] bg-gradient-to-b from-[#203746] to-[#101d28] px-6 py-10 text-center">

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-4 text-2xl text-[#9bb6c8] hover:text-white"
          >
            ×
          </button>

          <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full border border-[#607d90] bg-[#1b303d] shadow-[0_0_35px_#8eb8d020]">
            <CharmIcon charm={charm} size="detail" />
          </div>

          <h2
            id="charm-title"
            className="text-3xl font-bold text-white"
          >
            {charm.name}
          </h2>

          <p className="mt-2 text-sm tracking-widest text-[#91afc3]">
            {charm.nameEn}
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-[#587589] bg-[#253c4a] px-4 py-2 text-xs text-[#d3e6f1]">
              {charm.notches} muescas
            </span>

            <span className="rounded-full border border-[#587589] bg-[#253c4a] px-4 py-2 text-xs text-[#d3e6f1]">
              {charm.region}
            </span>

            {charm.isTransformation && (
              <span className="rounded-full border border-purple-400/40 bg-purple-900/30 px-4 py-2 text-xs text-purple-200">
                Transformación
              </span>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="space-y-4 p-6">

          <InfoSection title="Descripción">
            <p className="text-sm leading-7 text-[#b7c9d5]">
              {charm.description}
            </p>
          </InfoSection>

          <InfoSection title="Efecto y funcionamiento">
            <p className="text-sm leading-7 text-[#b7c9d5]">
              {charm.detailedEffect || charm.effect}
            </p>
          </InfoSection>

          <InfoSection title="Ubicación">
            <p className="font-medium text-[#d5e5ee]">
              {charm.locationDetails?.area || charm.location}
            </p>

            <p className="mt-2 text-sm text-[#9eb8ca]">
              {charm.locationDetails?.description ||
                `${charm.region} — ${charm.location}`}
            </p>

            <button
              type="button"
              disabled={!charm.locationDetails?.mapPointId}
              className="mt-4 rounded-lg border border-[#587589] px-4 py-2 text-xs text-[#b9d8e9] transition hover:bg-[#263e4d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver ubicación en el mapa
            </button>
          </InfoSection>

          <InfoSection title="Cómo conseguirlo">
            <p className="text-sm leading-7 text-[#b7c9d5]">
              {charm.obtainedFrom}
            </p>

            {charm.acquisition && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-[#a8d2e7]">
                    Requisitos
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[#b7c9d5]">
                    {charm.acquisition.requirements.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-[#a8d2e7]">
                    Pasos
                  </p>
                  <ol className="list-inside list-decimal space-y-2 text-sm text-[#b7c9d5]">
                    {charm.acquisition.steps.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ol>
                </div>

                {charm.acquisition.tips.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-[#a8d2e7]">
                      Consejos
                    </p>
                    {charm.acquisition.tips.map((item, index) => (
                      <p key={index} className="text-sm text-[#b7c9d5]">
                        • {item}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </InfoSection>

          {charm.synergies && charm.synergies.length > 0 && (
            <InfoSection title="Sinergias">
              {charm.synergies.map((synergy, index) => (
                <p key={index} className="mb-2 text-sm text-[#b7c9d5]">
                  {synergy.description}
                </p>
              ))}
            </InfoSection>
          )}

          {charm.lore && (
            <InfoSection title="Historia y Lore">
              <p className="whitespace-pre-line text-sm leading-7 text-[#b7c9d5]">
                {charm.lore}
              </p>

              {charm.spoilers && (
                <p className="mt-3 text-xs text-amber-300">
                  Esta sección contiene spoilers.
                </p>
              )}
            </InfoSection>
          )}

          {charm.geoCost !== null && (
            <p className="text-right text-sm text-[#e4c78a]">
              Coste: {charm.geoCost.toLocaleString("es-CO")} Geo
            </p>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => onToggle(charm, !obtained)}
            className="w-full rounded-lg bg-[#bfd4e1] px-5 py-4 font-semibold text-[#0a1520] transition hover:bg-white disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : obtained
                ? "Marcar como pendiente"
                : "Marcar como conseguido"}
          </button>
        </div>
      </section>
    </div>
  );
}
