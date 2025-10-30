import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import type { CardData } from "data";
import { FlipCard } from "./FlipCard";
import { ProjectCard } from "./ProjectCard";
import { CardBack } from "./CardBack";

export type MobileCarouselProps = {
  items: CardData[];
  type: "needs" | "gives";
  highlightedIds: string[];
  selectedId: string | null;
  flippedIds: string[];
  onHover: (id: string, kind: "need" | "give") => void;
  onLeave: () => void;
  onToggle: (id: string) => void;
};

export function MobileCarousel({
  items,
  type,
  highlightedIds,
  selectedId,
  flippedIds,
  onHover,
  onLeave,
  onToggle,
}: MobileCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: false,
    loop: false,
    align: "start",
    skipSnaps: false,
    slidesToScroll: 1,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((api: any) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", () => onSelect(emblaApi));
    emblaApi.on("reInit", () => onSelect(emblaApi));
  }, [emblaApi, onSelect]);

  const kind = type === "needs" ? "need" : "give";

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-2">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className={`transition-all duration-300 w-[224px] h-[320px] flex-none snap-start rounded-[8px] ${
                highlightedIds.includes(item.id) ? "animate-pulse-glow" : ""
              } ${selectedId === item.id ? (type === "needs" ? "ring-4 ring-blue-500" : "ring-4 ring-orange-500") : ""}`}
              onMouseEnter={() => onHover(item.id, kind)}
              onMouseLeave={onLeave}
            >
              <FlipCard
                flipped={flippedIds.includes(item.id)}
                onToggle={() => onToggle(item.id)}
                front={
                  <ProjectCard
                    id={item.id}
                    imageUrl={item.imageUrl}
                    category={item.category}
                    title={item.title}
                    contact={item.contact as any}
                    link={(item as any).link}
                    type={type}
                    isCustom={(item as any).isCustom}
                  />
                }
                back={
                  <CardBack
                    title={item.title}
                    description={item.description}
                    skills={item.skills}
                    duration={item.duration}
                    contact={item.contact as any}
                    type={type}
                  />
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls - centered at bottom */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          className={`rounded-full bg-white/90 shadow px-3 py-2 text-lg ${canPrev ? "opacity-100" : "opacity-40"}`}
          aria-label="이전"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
        >
          ‹
        </button>
        <button
          type="button"
          className={`rounded-full bg-white/90 shadow px-3 py-2 text-lg ${canNext ? "opacity-100" : "opacity-40"}`}
          aria-label="다음"
          onClick={() => emblaApi?.scrollNext()}
          disabled={!canNext}
        >
          ›
        </button>
      </div>
    </div>
  );
}
