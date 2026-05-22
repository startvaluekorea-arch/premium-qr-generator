"use client"

import * as React from "react"
import qrcodegen from "nayuki-qr-code-generator"

const QRC = qrcodegen.QrCode

export default function QRGenerator() {
  // States
  const [text, setText] = React.useState("https://github.com/nayuki/QR-Code-generator")
  const [moduleStyle, setModuleStyle] = React.useState<"square" | "circle" | "rounded">("square")
  const [eccLevel, setEccLevel] = React.useState<"LOW" | "MEDIUM" | "QUARTILE" | "HIGH">("MEDIUM")
  const [borderSize, setBorderSize] = React.useState(4)
  const [borderStyle, setBorderStyle] = React.useState<"none" | "rounded" | "square">("none")
  const [colorMode, setColorMode] = React.useState<"solid" | "gradient">("solid")
  
  // Solid Colors
  const [qrColor, setQrColor] = React.useState("#000000") // 기본 검정색
  const [bgColor, setBgColor] = React.useState("#FFFFFF")
  
  // Gradient Colors
  const [gradStart, setGradStart] = React.useState("#8B5CF6")
  const [gradEnd, setGradEnd] = React.useState("#EC4899")
  const [gradDirection, setGradDirection] = React.useState<"linear-lr" | "linear-tb" | "linear-diag" | "radial">("linear-diag")

  // Generated SVG string ref/state
  const [svgContent, setSvgContent] = React.useState("")
  const [qrGridSize, setQrGridSize] = React.useState("21x21")
  const [qrVersion, setQrVersion] = React.useState(1)
  const [hasError, setHasError] = React.useState(false)

  // Presets
  const presets = [
    { type: "solid", qr: "#000000", bg: "#FFFFFF", style: "linear-gradient(135deg, #000 50%, #fff 50%)" },
    { type: "gradient", start: "#8B5CF6", end: "#EC4899", dir: "linear-diag", style: "linear-gradient(135deg, #8B5CF6, #EC4899)" },
    { type: "gradient", start: "#3B82F6", end: "#10B981", dir: "linear-lr", style: "linear-gradient(135deg, #3B82F6, #10B981)" },
    { type: "gradient", start: "#F59E0B", end: "#EF4444", dir: "linear-diag", style: "linear-gradient(135deg, #F59E0B, #EF4444)" },
    { type: "gradient", start: "#00F2FE", end: "#4FACFE", dir: "linear-tb", style: "linear-gradient(135deg, #00F2FE, #4FACFE)" },
    { type: "gradient", start: "#FF0844", end: "#FFB199", dir: "linear-diag", style: "linear-gradient(135deg, #FF0844, #FFB199)" },
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    setColorMode(preset.type as "solid" | "gradient")
    if (preset.type === "solid") {
      setQrColor(preset.qr || "#000000")
      setBgColor(preset.bg || "#FFFFFF")
    } else {
      setGradStart(preset.start || "#8B5CF6")
      setGradEnd(preset.end || "#EC4899")
      setGradDirection((preset.dir as any) || "linear-diag")
    }
  }

  // Helper to generate path data based on selected module style
  const generatePathData = (qr: any, border: number, style: string) => {
    const parts = []
    const r = 0.24 // Corner radius ratio for rounded squares

    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y)) {
          const px = x + border
          const py = y + border
          
          if (style === "circle") {
            parts.push(`M ${px} ${py + 0.5} a 0.5 0.5 0 1 0 1 0 a 0.5 0.5 0 1 0 -1 0`)
          } else if (style === "rounded") {
            parts.push(
              `M ${px + r} ${py} ` +
              `h ${1 - 2*r} ` +
              `a ${r} ${r} 0 0 1 ${r} ${r} ` +
              `v ${1 - 2*r} ` +
              `a ${r} ${r} 0 0 1 -${r} ${r} ` +
              `h -${1 - 2*r} ` +
              `a ${r} ${r} 0 0 1 -${r} -${r} ` +
              `v -${1 - 2*r} ` +
              `a ${r} ${r} 0 0 1 ${r} -${r} z`
            )
          } else {
            // Classic square
            parts.push(`M${px},${py}h1v1h-1z`)
          }
        }
      }
    }
    return parts.join(" ")
  }

  // Generate QR Code logic
  React.useEffect(() => {
    const activeText = text || " "
    
    // ECC Level mapping
    let ecc
    switch (eccLevel) {
      case "LOW": ecc = QRC.Ecc.LOW; break;
      case "MEDIUM": ecc = QRC.Ecc.MEDIUM; break;
      case "QUARTILE": ecc = QRC.Ecc.QUARTILE; break;
      case "HIGH": ecc = QRC.Ecc.HIGH; break;
      default: ecc = QRC.Ecc.MEDIUM
    }

    try {
      const qr = QRC.encodeText(activeText, ecc)
      setQrGridSize(`${qr.size}x${qr.size}`)
      setQrVersion(qr.version)
      setHasError(false)

      const pathData = generatePathData(qr, borderSize, moduleStyle)
      const size = qr.size + borderSize * 2

      // Color/Gradient Definitions
      let defs = ""
      let fillAttr = ""
      let bgFill = bgColor

      if (colorMode === "gradient") {
        bgFill = "#FFFFFF" // Force clean background for gradient QR code templates

        if (gradDirection === "radial") {
          defs = `
            <defs>
              <radialGradient id="qr-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stop-color="${gradStart}" />
                <stop offset="100%" stop-color="${gradEnd}" />
              </radialGradient>
            </defs>`
        } else {
          let coords = ""
          if (gradDirection === "linear-lr") {
            coords = 'x1="0%" y1="0%" x2="100%" y2="0%"'
          } else if (gradDirection === "linear-tb") {
            coords = 'x1="0%" y1="0%" x2="0%" y2="100%"'
          } else { // linear-diag
            coords = 'x1="0%" y1="0%" x2="100%" y2="100%"'
          }
          defs = `
            <defs>
              <linearGradient id="qr-grad" ${coords}>
                <stop offset="0%" stop-color="${gradStart}" />
                <stop offset="100%" stop-color="${gradEnd}" />
              </linearGradient>
            </defs>`
        }
        fillAttr = "url(#qr-grad)"
      } else {
        fillAttr = qrColor
      }

      // Border styles
      let extraBorderRect = ""
      if (borderStyle === "rounded" || borderStyle === "square") {
        const strokeColor = colorMode === "gradient" ? "url(#qr-grad)" : qrColor
        const rxVal = borderStyle === "rounded" ? (borderSize > 0 ? Math.min(2, borderSize * 0.5) : 1) : 0
        extraBorderRect = `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="${rxVal}" fill="none" stroke="${strokeColor}" stroke-width="0.25"/>`
      }

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${size} ${size}" stroke="none" width="450" height="450">
        ${defs}
        <rect width="100%" height="100%" fill="${bgFill}"/>
        <path d="${pathData}" fill="${fillAttr}"/>
        ${extraBorderRect}
      </svg>`

      setSvgContent(svgString)
    } catch (e) {
      console.error(e)
      setHasError(true)
    }
  }, [text, moduleStyle, eccLevel, borderSize, borderStyle, colorMode, qrColor, bgColor, gradStart, gradEnd, gradDirection])

  // Download SVG
  const downloadSvg = () => {
    if (!svgContent) return
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `qrcode_${Date.now()}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Download PNG (1024x1024 고해상도 유지)
  const downloadPng = () => {
    if (!svgContent) return

    const exportSize = 1024
    const canvas = document.createElement("canvas")
    canvas.width = exportSize
    canvas.height = exportSize
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const svgBlob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)
    
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, exportSize, exportSize)
      const pngUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = pngUrl
      link.download = `qrcode_${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl w-full mx-auto px-4 pb-20 relative z-10">
      
      {/* Options Panel (Col 7) */}
      <section className="lg:col-span-7 flex flex-col gap-6 p-6 rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 shadow-2xl">
        <h2 className="text-xl font-bold text-white border-l-4 border-violet-500 pl-3">QR 코드 커스텀</h2>
        
        {/* Content Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-neutral-400">콘텐츠 (텍스트 또는 URL)</label>
          <div className="relative">
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[90px] bg-neutral-950/60 border border-neutral-800 focus:border-violet-500 rounded-xl p-3 text-sm text-neutral-200 outline-none transition-all resize-y"
              placeholder="QR 코드로 변환할 URL이나 텍스트를 적어주세요..."
            />
            <div className="absolute bottom-2 right-3 text-xs text-neutral-500">{text.length}자</div>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Module Style */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-400">모듈 디자인</label>
            <select 
              value={moduleStyle} 
              onChange={(e) => setModuleStyle(e.target.value as any)}
              className="bg-neutral-950/60 border border-neutral-800 text-neutral-200 text-sm rounded-xl p-3 outline-none cursor-pointer focus:border-violet-500 transition-all"
            >
              <option value="square">클래식 사각형</option>
              <option value="circle">모던 원형</option>
              <option value="rounded">둥근 사각형</option>
            </select>
          </div>

          {/* ECC Level */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-400">오류 정정 (ECC)</label>
            <select 
              value={eccLevel} 
              onChange={(e) => setEccLevel(e.target.value as any)}
              className="bg-neutral-950/60 border border-neutral-800 text-neutral-200 text-sm rounded-xl p-3 outline-none cursor-pointer focus:border-violet-500 transition-all"
            >
              <option value="LOW">LOW (7% 복구)</option>
              <option value="MEDIUM">MEDIUM (15% 복구)</option>
              <option value="QUARTILE">QUARTILE (25% 복구)</option>
              <option value="HIGH">HIGH (30% 복구)</option>
            </select>
          </div>

          {/* Quiet Zone */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-400">테두리 여백 (Quiet Zone): {borderSize}</label>
            <div className="flex items-center gap-4 h-11 bg-neutral-950/60 border border-neutral-800 px-3 rounded-xl">
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={borderSize} 
                onChange={(e) => setBorderSize(parseInt(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Border Style */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-neutral-400">외곽 테두리 스타일</label>
            <select 
              value={borderStyle} 
              onChange={(e) => setBorderStyle(e.target.value as any)}
              className="bg-neutral-950/60 border border-neutral-800 text-neutral-200 text-sm rounded-xl p-3 outline-none cursor-pointer focus:border-violet-500 transition-all"
            >
              <option value="none">없음</option>
              <option value="rounded">라운드</option>
              <option value="square">각진네모</option>
            </select>
          </div>
        </div>

        {/* Color Customization */}
        <div className="flex flex-col gap-4 border-t border-neutral-800/80 pt-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setColorMode("solid")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${colorMode === "solid" ? "bg-neutral-800 border-neutral-700 text-white" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
            >
              단색
            </button>
            <button 
              onClick={() => setColorMode("gradient")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${colorMode === "gradient" ? "bg-neutral-800 border-neutral-700 text-white" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
            >
              그라디언트
            </button>
          </div>

          {/* Solid Color Panel */}
          {colorMode === "solid" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-400">QR 색상</span>
                <div className="flex bg-neutral-950/60 border border-neutral-800 p-1.5 rounded-xl items-center gap-2">
                  <input 
                    type="color" 
                    value={qrColor} 
                    onChange={(e) => setQrColor(e.target.value)} 
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={qrColor.toUpperCase()} 
                    onChange={(e) => setQrColor(e.target.value)}
                    className="bg-transparent border-none text-xs text-neutral-200 outline-none w-20 uppercase font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-400">배경 색상</span>
                <div className="flex bg-neutral-950/60 border border-neutral-800 p-1.5 rounded-xl items-center gap-2">
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => setBgColor(e.target.value)} 
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={bgColor.toUpperCase()} 
                    onChange={(e) => setBgColor(e.target.value)}
                    className="bg-transparent border-none text-xs text-neutral-200 outline-none w-20 uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Gradient Color Panel */}
          {colorMode === "gradient" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-400">시작 색상</span>
                <div className="flex bg-neutral-950/60 border border-neutral-800 p-1.5 rounded-xl items-center gap-2">
                  <input 
                    type="color" 
                    value={gradStart} 
                    onChange={(e) => setGradStart(e.target.value)} 
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={gradStart.toUpperCase()} 
                    onChange={(e) => setGradStart(e.target.value)}
                    className="bg-transparent border-none text-xs text-neutral-200 outline-none w-20 uppercase font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-400">종료 색상</span>
                <div className="flex bg-neutral-950/60 border border-neutral-800 p-1.5 rounded-xl items-center gap-2">
                  <input 
                    type="color" 
                    value={gradEnd} 
                    onChange={(e) => setGradEnd(e.target.value)} 
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <input 
                    type="text" 
                    value={gradEnd.toUpperCase()} 
                    onChange={(e) => setGradEnd(e.target.value)}
                    className="bg-transparent border-none text-xs text-neutral-200 outline-none w-20 uppercase font-mono"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-semibold text-neutral-400">그라디언트 방향</label>
                <select 
                  value={gradDirection} 
                  onChange={(e) => setGradDirection(e.target.value as any)}
                  className="bg-neutral-950/60 border border-neutral-800 text-neutral-200 text-sm rounded-xl p-3 outline-none cursor-pointer focus:border-violet-500 transition-all"
                >
                  <option value="linear-lr">가로 (왼쪽 → 오른쪽)</option>
                  <option value="linear-tb">세로 (위 → 아래)</option>
                  <option value="linear-diag">대각선 (왼쪽 위 → 오른쪽 아래)</option>
                  <option value="radial">방사형 (중앙 → 바깥쪽)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Premium Presets */}
        <div className="flex flex-col gap-2 border-t border-neutral-800/80 pt-4">
          <label className="text-xs font-semibold text-neutral-400">프리미엄 컬러 프리셋</label>
          <div className="flex gap-3 flex-wrap">
            {presets.map((preset, idx) => (
              <button 
                key={idx}
                onClick={() => applyPreset(preset)}
                style={{ background: preset.style }}
                className="w-9 h-9 rounded-full cursor-pointer border border-neutral-800 shadow-md hover:scale-115 active:scale-95 transition-all"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Preview Panel (Col 5) */}
      <section className="lg:col-span-5 flex flex-col items-center justify-between p-6 rounded-2xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 shadow-2xl gap-6">
        <h2 className="text-xl font-bold text-white w-full border-l-4 border-violet-500 pl-3">라이브 미리보기</h2>
        
        {/* Preview Area (450x450 Max Size) */}
        <div className="flex items-center justify-center p-4 bg-white border border-neutral-800 rounded-2xl shadow-xl w-full max-w-[450px] aspect-square relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-101">
          {hasError ? (
            <div className="text-center text-xs text-rose-500 font-semibold p-4">
              텍스트의 양이 너무 많습니다.<br />오류 정정 레벨을 낮추거나 텍스트를 줄여주세요.
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center svg-container" 
              dangerouslySetInnerHTML={{ __html: svgContent }} 
            />
          )}
        </div>

        {/* Info Badges */}
        <div className="flex gap-4 justify-center w-full">
          <div className="flex flex-col items-center bg-neutral-950/60 border border-neutral-800 py-2 px-4 rounded-xl min-w-[110px]">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">QR 크기</span>
            <span className="text-sm font-extrabold text-violet-400">450x450</span>
          </div>
          <div className="flex flex-col items-center bg-neutral-950/60 border border-neutral-800 py-2 px-4 rounded-xl min-w-[110px]">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">격자/버전</span>
            <span className="text-sm font-extrabold text-violet-400">{qrGridSize} (v{qrVersion})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <button 
            onClick={downloadSvg}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-violet-950/20 active:translate-y-0.5 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            SVG 다운로드
          </button>
          <button 
            onClick={downloadPng}
            className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-bold text-sm py-3 px-4 rounded-xl active:translate-y-0.5 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            PNG 다운로드
          </button>
        </div>
      </section>

      {/* Global CSS Inject to customize SVG width inside preview container */}
      <style jsx global>{`
        .svg-container svg {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      `}</style>
    </div>
  )
}
