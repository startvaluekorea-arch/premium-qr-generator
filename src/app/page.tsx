import * as React from "react"
import { Hero } from "@/components/ui/hero"
import QRGenerator from "@/components/QRGenerator"

export const metadata = {
  title: "사단법인 아름다운사람들 QR Studio",
  description: "사단법인 아름다운사람들 실시간 스타일 커스터마이징 및 고해상도 다운로드를 지원하는 프리미엄 QR 코드 생성기입니다.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start overflow-x-hidden relative">
      
      {/* Background Glow Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/10 blur-[130px]" />
      </div>

      {/* Header Logotype */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-neutral-900 z-10 relative">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="10" height="10" rx="2.5" stroke="url(#logo-grad)" strokeWidth="2.5"/>
            <rect x="5" y="5" width="4" height="4" rx="1" fill="url(#logo-grad)"/>
            <rect x="20" y="2" width="10" height="10" rx="2.5" stroke="url(#logo-grad)" strokeWidth="2.5"/>
            <rect x="23" y="5" width="4" height="4" rx="1" fill="url(#logo-grad)"/>
            <rect x="2" y="20" width="10" height="10" rx="2.5" stroke="url(#logo-grad)" strokeWidth="2.5"/>
            <rect x="5" y="23" width="4" height="4" rx="1" fill="url(#logo-grad)"/>
            <path d="M20 20h3v3h-3zm5 0h3v3h-3zm-5 5h3v3h-3zm5 5h3v-3h-3zm0 0h3v3h-3zm3-5h2v2h-2zm-3-3h3v3h-3z" fill="url(#logo-grad)"/>
            <defs>
              <linearGradient id="logo-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6"/>
                <stop offset="1" stopColor="#EC4899"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            사단법인 아름다운사람들 QR Studio
          </span>
        </div>
        <div className="text-xs font-semibold text-neutral-500">v1.2 Live</div>
      </header>

      {/* Hero Header Area with Lamp effect */}
      <Hero
        title="사단법인 아름다운사람들 QR Studio"
        subtitle="원하는 텍스트나 링크를 입력하고 프리미엄 템플릿, 모듈형 스타일링, 그리고 외곽 테두리 디자인을 더해 나만의 고유한 벡터 QR 코드를 생성해 보세요."
        gradient={true}
        blur={true}
        titleClassName="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent leading-tight"
        subtitleClassName="text-sm md:text-base text-neutral-400 max-w-[650px] mt-4"
        className="w-full border-0 relative z-10 min-h-[30vh] py-4"
      />

      {/* Core Interactive QR Generator Component */}
      <QRGenerator />

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900/60 py-6 mt-auto text-center text-xs text-neutral-600 z-10 relative">
        <p>© 2026 사단법인 아름다운사람들. All rights reserved. Powered by Project Nayuki Engine.</p>
      </footer>
    </main>
  )
}
