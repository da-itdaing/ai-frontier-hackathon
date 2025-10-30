import svgPaths from "../imports/svg-63jcvnjryn";
import { ImageWithFallback } from "./images_fb/ImageWithFallback";
import { ExternalLink } from "lucide-react";

interface ProjectCardProps {
  id?: string;
  imageUrl: string;
  category: string;
  title: string;
  contact?: string;
  link?: string;
  type: "needs" | "gives";
  isCustom?: boolean;
}

function ShareButton() {
  return (
    <div className="bg-[#d1d1d1] box-border content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[48px] shrink-0">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Share">
        <div className="absolute inset-[8.33%_16.67%_8.33%_8.33%]" data-name="Vector">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 14">
            <path d={svgPaths.p3bfbab00} fill="var(--fill-0, black)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SaveButton() {
  return (
    <div className="bg-[#d1d1d1] box-border content-stretch flex gap-[8px] items-center p-[8px] relative rounded-[48px] shrink-0">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Save">
        <div className="absolute bottom-[14.31%] left-1/4 right-1/4 top-[12.5%]" data-name="Vector">
          <div className="absolute inset-[-4.27%_-6.25%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 13">
              <path d={svgPaths.p3ce2d200} fill="var(--fill-0, black)" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoButton() {
  return (
    <div className="bg-[#d1d1d1] box-border content-stretch flex gap-[8px] h-[28px] items-center p-[8px] relative rounded-[48px] shrink-0 w-[29px]">
      <div className="relative shrink-0 size-[15.988px]" data-name="Go">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g clipPath="url(#clip0_3_59)" id="Go">
            <path d={svgPaths.p26eb13f0} fill="var(--fill-0, black)" id="Vector" />
          </g>
          <defs>
            <clipPath id="clip0_3_59">
              <rect fill="white" height="15.9883" width="15.9883" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <div className="shrink-0 size-[32px]" data-name="Go" />
    </div>
  );
}

// Removed bottom action buttons for cleaner UI under contact

export function ProjectCard({ id, imageUrl, category, title, contact, link, type, isCustom }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!id) return;
    const key = type === "needs" ? "custom_needs" : "custom_gives";
    try {
      const prev = localStorage.getItem(key);
      const list: any[] = prev ? JSON.parse(prev) : [];
      const next = list.filter((item) => item && item.id !== id);
      localStorage.setItem(key, JSON.stringify(next));
      // notify app to refresh merged data
      window.dispatchEvent(new Event("data:updated"));
    } catch {}
  };
  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!link) return;
    const ok = window.confirm("링크로 접속하시겠습니까?");
    if (ok) window.open(link, "_blank", "noopener");
  };
  return (
    <div className="relative w-[224px] h-[320px] rounded-[8px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      {link && (
        <button
          type="button"
          onClick={handleOpenLink}
          className="absolute left-2 top-2 z-10 rounded-full bg-white/90 hover:bg-white text-gray-800 w-7 h-7 flex items-center justify-center shadow"
          aria-label="링크로 이동"
          title="링크 열기"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      )}
      {isCustom && (
        <button
          type="button"
          onClick={handleDelete}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/60 hover:bg-black/75 text-white w-7 h-7 flex items-center justify-center"
          aria-label="항목 삭제"
          title="삭제"
        >
          ×
        </button>
      )}
      <div className="absolute h-[160px] left-0 top-0 w-[224px]">
        <ImageWithFallback alt={title} className="absolute inset-0 max-w-none object-center object-cover pointer-events-none size-full rounded-tl-[8px] rounded-tr-[8px]" src={imageUrl} />
      </div>
      
      <div className="absolute bg-[#f6f6f6] box-border content-stretch flex flex-col gap-[8px] items-start left-0 p-[16px] rounded-bl-[8px] rounded-br-[8px] top-[160px] w-full h-[160px]">
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
          <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[1.2] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px] w-[min-content]">{category}</p>
          <div className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[16px] text-black w-[192px] min-h-[38px]">
            {title}
          </div>
          <div className="w-[192px] flex items-center justify-between gap-2">
            {contact && (
              <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#666] whitespace-nowrap overflow-hidden text-ellipsis">
              📧 {contact}
              </p>
            )}
            
            {link && (
              <button
                type="button"
                onClick={handleOpenLink}
                className="text-[12px] text-blue-600 hover:underline flex items-center gap-1"
              >
              <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
          {/* Action buttons removed */}
        </div>
      </div>
    </div>
  );
}
