import { Badge } from "./ui/badge";

interface CardBackProps {
  title: string;
  description: string;
  skills: string[];
  duration?: string;
  contact?: string;
  type: "needs" | "gives";
}

export function CardBack({ title, description, skills, duration, contact, type }: CardBackProps) {
  // Keep a consistent white background when flipped
  const bgColor = "bg-white";
  const accentColor = type === "needs" ? "bg-blue-500" : "bg-orange-500";
  
  return (
    <div className={`w-[224px] h-[320px] ${bgColor} rounded-[8px] shadow-lg p-[20px] flex flex-col gap-[12px]`}>
      <div className={`w-full h-[4px] ${accentColor} rounded-full mb-[8px]`} />
      
      <h3 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold text-[18px] text-black leading-[1.2]">
        {title}
      </h3>
      
      <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[13px] text-[#3d3d3d] leading-[1.4] flex-1">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-[6px] mb-[8px]">
        {skills.map((skill, idx) => (
          <Badge key={idx} variant="secondary" className="text-[11px] px-[8px] py-[2px]">
            {skill}
          </Badge>
        ))}
      </div>
      
      {(duration || contact) && (
        <div className="flex flex-col gap-[4px] pt-[8px] border-t border-gray-300">
          {duration && (
            <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#666]">
              ⏱️ {duration}
            </p>
          )}
          {contact && (
            <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[12px] text-[#666]">
              💬 {contact}
            </p>
          )}
        </div>
      )}
      
      <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[10px] text-[#999] text-center mt-auto">
        클릭하여 앞면 보기
      </p>
    </div>
  );
}
