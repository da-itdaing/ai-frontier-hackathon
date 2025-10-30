import { Phone, MapPin, Github, Twitter, Linkedin, School } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-white text-[14px]">D</span>
              </div>
              <h3 className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[20px] text-white">
                다잇다잉
              </h3>
            </div>
            <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-gray-400 mb-4">
              해커톤과 공모전의 혁신적인 아이디어를<br></br>실제 도움이 필요한 사람들에게 연결합니다.
            </p>
            <div className="flex gap-3">
              <a href="https://gj-aischool.or.kr/" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <School className="w-4 h-4" />
              </a>
              <a href="https://github.com/da-itdaing/ai-frontier-hackathon" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-white text-[16px] mb-4">
              빠른 링크
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  서비스 소개
                </a>
              </li>
              <li>
                <a href="#/request" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  도움 요청하기
                </a>
              </li>
              <li>
                <a href="#/submit" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-orange-400 transition-colors">
                  솔루션 제공하기
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  이용 방법
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-white text-[16px] mb-4">
              지원
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a href="#" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  이용 약관
                </a>
              </li>
              <li>
                <a href="#" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  개인정보 처리방침
                </a>
              </li>
              <li>
                <a href="#" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  고객 지원
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Inter:Semi_Bold','Noto_Sans_KR:Bold',sans-serif] text-white text-[16px] mb-4">
              연락처
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                {/* KakaoTalk emoji icon (replaces Mail/email) */}
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 inline-flex w-4 h-4 items-center justify-center rounded-sm"
                >
                  💬
                </span>
                <a
                  href="https://open.kakao.com/o/xxxxx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-yellow-400 transition-colors"
                  title="카카오톡 오픈채팅으로 문의"
                >
                  카카오톡 오픈채팅
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <a href="tel:02-1234-5678" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] hover:text-blue-400 transition-colors">
                  010-2238-0609
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px]">
                  광주광역시 동구 제봉로 92 (대성학원 1-3층)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] text-gray-500">
              © 2025 다잇다잉. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] text-gray-500 hover:text-blue-400 transition-colors">
                개인정보처리방침
              </a>
              <a href="#" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] text-gray-500 hover:text-blue-400 transition-colors">
                이용약관
              </a>
              <a href="#" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] text-gray-500 hover:text-blue-400 transition-colors">
                쿠키 정책
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
