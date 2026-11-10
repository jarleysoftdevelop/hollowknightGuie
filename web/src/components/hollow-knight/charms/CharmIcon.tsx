
"use client";

import { useState } from "react";
import type { Charm } from "@/services/charms.service";

interface CharmIconProps {
  charm: Charm;
  size?: "card" | "detail";
}

export default function CharmIcon({
  charm,
  size = "card",
}: CharmIconProps) {
  const [failed, setFailed] = useState(false);

  const imageSrc =
    charm.imagePath ||
    `/images/hollow-knight/charms/${charm.id}.png`;

  const dimension = size === "card" ? "h-24 w-24" : "h-20 w-20";

  return (
    <div className={`relative flex ${dimension} items-center justify-center`}>
      {!failed ? (
        <img
          src={imageSrc}
          alt={charm.name}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain drop-shadow-[0_0_12px_#a8cfe455]"
        />
      ) : (
        <span className="text-5xl text-[#a8cfe4]">✧</span>
      )}
    </div>
  );
}
