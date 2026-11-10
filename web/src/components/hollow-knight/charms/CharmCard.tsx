
"use client";

import type { Charm } from "@/services/charms.service";
import CharmIcon from "./CharmIcon";

interface CharmCardProps {
  charm: Charm;
  obtained: boolean;
  onSelect: (charm: Charm) => void;
}

export default function CharmCard({
  charm,
  obtained,
  onSelect,
}: CharmCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(charm)}
      className={`
        group relative flex min-h-56 flex-col items-center
        justify-between overflow-hidden rounded-xl border
        p-5 text-center transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_0_25px_#a7c9df15]
        ${
          obtained
            ? "border-[#8eb8d0]/60 bg-[#182b37]/90"
            : "border-[#344958] bg-[#101b25]/90 hover:border-[#8eb8d0]"
        }
      `}
    >
      <div
        className={`absolute left-0 top-0 h-1 w-full ${
          obtained ? "bg-[#a8d2e7]" : "bg-transparent"
        }`}
      />

      <div className="flex h-24 w-24 items-center justify-center">
        
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#486477] bg-[#203340]/50 text-4xl text-[#a8c9dc]">
            <CharmIcon charm={charm} />
        </div>
        
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#e5edf3]">
          {charm.name}
        </h3>

        <p className="text-xs text-[#8daabe]">
          {charm.notches}{" "}
          {charm.notches === 1 ? "muesca" : "muescas"}
        </p>
      </div>

      <span
        className={`rounded-full border px-3 py-1 text-[10px] tracking-wide ${
          obtained
            ? "border-[#8eb8d0]/50 bg-[#8eb8d0]/15 text-[#b9e1f5]"
            : "border-[#405564] text-[#7f9bad]"
        }`}
      >
        {obtained ? "CONSEGUIDO" : "PENDIENTE"}
      </span>
    </button>
  );
}
