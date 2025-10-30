import { motion } from "motion/react";
import { useState } from "react";

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  // When provided, puts the card in controlled mode
  flipped?: boolean;
  onToggle?: () => void;
}

export function FlipCard({ front, back, flipped, onToggle }: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = flipped ?? internalFlipped;
  const handleClick = () => {
    if (typeof flipped === "boolean") {
      onToggle?.();
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  return (
    <div className="perspective-1000 w-[224px] h-[320px] cursor-pointer" onClick={handleClick}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {front}
        </div>

        {/* Back */}
        <div
          className="absolute w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
}
