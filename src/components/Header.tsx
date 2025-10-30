import { Button } from "./ui/button";
import { Menu, X, Upload } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo (clickable to home) */}
          <a
            href="#"
            aria-label="홈으로 이동"
            className="flex items-center gap-3"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-white text-[18px]">D</span>
              </div>
              <div>
                <h1 className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] text-[24px] bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                  다잇다잉
                </h1>
              </div>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#about" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 transition-colors">
              소개
            </a>
            <a href="#needs" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 transition-colors">
              도움 요청
            </a>
            <a href="#gives" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-orange-600 transition-colors">
              솔루션 제공
            </a>
            <a href="#how-it-works" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 transition-colors">
              이용 방법
            </a>
            <a href="#/request" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 transition-colors">
              도움 요청하기
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#/submit">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700">
                <Upload className="w-4 h-4" />
                솔루션 제출
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col gap-3">
              <a href="#about" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 py-2">
                소개
              </a>
              <a href="#needs" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 py-2">
                도움 요청
              </a>
              <a href="#gives" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-orange-600 py-2">
                솔루션 제공
              </a>
              <a href="#how-it-works" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 py-2">
                이용 방법
              </a>
              <a href="#/request" className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-gray-700 hover:text-blue-600 py-2">
                도움 요청하기
              </a>
              <div className="flex flex-col gap-2 mt-2">
                <a href="#/submit">
                  <Button size="sm" className="gap-2 justify-start bg-gradient-to-r from-blue-600 to-orange-600">
                    <Upload className="w-4 h-4" />
                    솔루션 제출
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
