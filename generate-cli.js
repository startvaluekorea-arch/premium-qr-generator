import fs from 'fs';
import path from 'path';
import qrcodegen from 'nayuki-qr-code-generator';

const QRC = qrcodegen.QrCode;

// Helper to print usage
function printUsage() {
  console.log(`
사용법: node generate-cli.js <text> [options]

옵션:
  -o, --output <file>    출력할 SVG 파일 경로 (기본값: qrcode.svg)
  -e, --ecc <level>      오류 정정 레벨 (LOW, MEDIUM, QUARTILE, HIGH) (기본값: MEDIUM)
  -b, --border <number>  테두리 여백 크기 (기본값: 4)
  -c, --color <hex>      QR 코드 색상 (기본값: #000000)
  -bg, --background <hex> 배경 색상 (기본값: #FFFFFF)

예제:
  node generate-cli.js "https://google.com" -o google-qr.svg -e HIGH -c "#1A73E8"
  `);
}

// Parse args
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  printUsage();
  process.exit(0);
}

const text = args[0];
let outputFile = 'qrcode.svg';
let eccLevel = QRC.Ecc.MEDIUM;
let border = 4;
let color = '#000000';
let bg = '#FFFFFF';

for (let i = 1; i < args.length; i++) {
  const arg = args[i];
  if ((arg === '-o' || arg === '--output') && i + 1 < args.length) {
    outputFile = args[++i];
  } else if ((arg === '-e' || arg === '--ecc') && i + 1 < args.length) {
    const eccStr = args[++i].toUpperCase();
    if (eccStr === 'LOW' || eccStr === 'L') eccLevel = QRC.Ecc.LOW;
    else if (eccStr === 'MEDIUM' || eccStr === 'M') eccLevel = QRC.Ecc.MEDIUM;
    else if (eccStr === 'QUARTILE' || eccStr === 'Q') eccLevel = QRC.Ecc.QUARTILE;
    else if (eccStr === 'HIGH' || eccStr === 'H') eccLevel = QRC.Ecc.HIGH;
    else {
      console.warn(`[경고] 알 수 없는 ECC 레벨: ${eccStr}. 기본값(MEDIUM)을 사용합니다.`);
    }
  } else if ((arg === '-b' || arg === '--border') && i + 1 < args.length) {
    const val = parseInt(args[++i], 10);
    if (!isNaN(val) && val >= 0) {
      border = val;
    } else {
      console.warn(`[경고] 유효하지 않은 테두리 값: ${args[i]}. 기본값(4)을 사용합니다.`);
    }
  } else if ((arg === '-c' || arg === '--color') && i + 1 < args.length) {
    color = args[++i];
  } else if ((arg === '-bg' || arg === '--background') && i + 1 < args.length) {
    bg = args[++i];
  }
}

// Function to generate SVG string
function toSvgString(qr, border, fillColor, bgColor) {
  if (border < 0) throw new RangeError("Border must be non-negative");
  
  const parts = [];
  for (let y = 0; y < qr.size; y++) {
    for (let x = 0; x < qr.size; x++) {
      if (qr.getModule(x, y)) {
        parts.push(`M${x + border},${y + border}h1v1h-1z`);
      }
    }
  }
  
  const size = qr.size + border * 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${size} ${size}" stroke="none">
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <path d="${parts.join(' ')}" fill="${fillColor}"/>
</svg>
`;
}

try {
  const qr = QRC.encodeText(text, eccLevel);
  const svgContent = toSvgString(qr, border, color, bg);
  
  const absolutePath = path.resolve(outputFile);
  fs.writeFileSync(absolutePath, svgContent, 'utf-8');
  console.log(`✅ QR 코드가 성공적으로 생성되었습니다: ${absolutePath}`);
} catch (error) {
  console.error("❌ QR 코드 생성 중 오류가 발생했습니다:", error.message);
  process.exit(1);
}
