import svgPaths from "./svg-63jcvnjryn";
import imgRectangle from "figma:asset/3edb56131593ba6e663bec6afbf4758cc55f749a.png";
import img from "figma:asset/b42be4d3edb81e83f8380d33a931be8a52e922b8.png";

function Frame2() {
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

function Frame3() {
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

function Go() {
  return (
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
  );
}

function Frame4() {
  return (
    <div className="bg-[#d1d1d1] box-border content-stretch flex gap-[8px] h-[28px] items-center p-[8px] relative rounded-[48px] shrink-0 w-[29px]">
      <Go />
      <div className="shrink-0 size-[32px]" data-name="Go" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
      <Frame2 />
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0">
      <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[1.2] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px] w-[min-content]">환경</p>
      <div className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] font-semibold leading-[1.2] not-italic relative shrink-0 text-[16px] text-black w-[192px]">
        <p className="mb-0">우리 동네</p>
        <p>탄소 중립 챌린지</p>
      </div>
      <Frame5 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute bg-[#f6f6f6] box-border content-stretch flex flex-col gap-[8px] items-start left-0 p-[16px] rounded-bl-[8px] rounded-br-[8px] top-[170px]">
      <Frame7 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center leading-[1.2] not-italic relative shrink-0 text-black">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold relative shrink-0 text-[20px] text-center w-full">24</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal relative shrink-0 text-[16px] w-full">NOV</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-[#f6f6f6] box-border content-stretch flex gap-[8px] items-center left-[157px] p-[8px] rounded-[8px] shadow-[2px_2px_8.2px_0px_rgba(0,0,0,0.2)] top-[141px]">
      <Frame />
    </div>
  );
}

export default function UiCard() {
  return (
    <div className="relative size-full" data-name="UI card 50">
      <Frame6 />
      <div className="absolute h-[170px] left-0 top-0 w-[224px]" data-name="Rectangle">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgRectangle} />
        <div className="absolute inset-0 rounded-tl-[8px] rounded-tr-[8px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]">
            <div className="absolute bg-[#d9d9d9] inset-0 rounded-tl-[8px] rounded-tr-[8px]" />
            <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tl-[8px] rounded-tr-[8px] size-full" src={img} />
          </div>
        </div>
      </div>
      <Frame1 />
    </div>
  );
}