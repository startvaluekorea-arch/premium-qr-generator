import qrcodegen from 'nayuki-qr-code-generator';

const QRC = qrcodegen.QrCode;

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const qrTextInput = document.getElementById('qr-text');
  const charCountSpan = document.getElementById('char-count');
  const moduleStyleSelect = document.getElementById('module-style');
  const eccLevelSelect = document.getElementById('ecc-level');
  const borderSizeInput = document.getElementById('border-size');
  const borderValueSpan = document.getElementById('border-value');
  const borderStyleSelect = document.getElementById('border-style');
  
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  
  // Color controls
  const colorTabBtns = document.querySelectorAll('.color-mode-tabs .tab-btn');
  const solidControls = document.getElementById('solid-color-controls');
  const gradientControls = document.getElementById('gradient-color-controls');
  
  const qrColorInput = document.getElementById('qr-color');
  const qrColorTextInput = document.getElementById('qr-color-text');
  const bgColorInput = document.getElementById('bg-color');
  const bgColorTextInput = document.getElementById('bg-color-text');
  
  const gradStartInput = document.getElementById('grad-start');
  const gradStartTextInput = document.getElementById('grad-start-text');
  const gradEndInput = document.getElementById('grad-end');
  const gradEndTextInput = document.getElementById('grad-end-text');
  const gradDirectionSelect = document.getElementById('grad-direction');
  
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  // Preview & Info
  const svgContainer = document.getElementById('qrcode-svg-container');
  const previewCard = document.getElementById('qrcode-preview-card');
  const infoSizeSpan = document.getElementById('info-size');
  const infoVersionSpan = document.getElementById('info-version');
  
  // Actions
  const downloadSvgBtn = document.getElementById('download-svg-btn');
  const downloadPngBtn = document.getElementById('download-png-btn');

  // State
  let colorMode = 'solid'; // 'solid' or 'gradient'
  let currentSvgString = '';

  // Theme handling
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
  });

  // Sync color inputs (Color picker & Hex Text input)
  function syncColorPickers(picker, textInput) {
    picker.addEventListener('input', (e) => {
      textInput.value = e.target.value.toUpperCase();
      generateQRCode();
    });
    textInput.addEventListener('input', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-F]{6}$/i.test(val)) {
        picker.value = val;
        generateQRCode();
      }
    });
  }

  syncColorPickers(qrColorInput, qrColorTextInput);
  syncColorPickers(bgColorInput, bgColorTextInput);
  syncColorPickers(gradStartInput, gradStartTextInput);
  syncColorPickers(gradEndInput, gradEndTextInput);

  // Tab switcher
  colorTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      colorMode = btn.dataset.mode;
      if (colorMode === 'solid') {
        solidControls.classList.remove('hidden');
        gradientControls.classList.add('hidden');
      } else {
        solidControls.classList.add('hidden');
        gradientControls.classList.remove('hidden');
      }
      generateQRCode();
    });
  });

  // Presets
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active-preset'));
      btn.classList.add('active-preset');

      const type = btn.dataset.type;
      
      // Update Tab state
      colorTabBtns.forEach(b => {
        if (b.dataset.mode === type) b.classList.add('active');
        else b.classList.remove('active');
      });
      colorMode = type;

      if (type === 'solid') {
        solidControls.classList.remove('hidden');
        gradientControls.classList.add('hidden');
        
        qrColorInput.value = btn.dataset.qr;
        qrColorTextInput.value = btn.dataset.qr.toUpperCase();
        bgColorInput.value = btn.dataset.bg;
        bgColorTextInput.value = btn.dataset.bg.toUpperCase();
      } else {
        solidControls.classList.add('hidden');
        gradientControls.classList.remove('hidden');
        
        gradStartInput.value = btn.dataset.start;
        gradStartTextInput.value = btn.dataset.start.toUpperCase();
        gradEndInput.value = btn.dataset.end;
        gradEndTextInput.value = btn.dataset.end.toUpperCase();
        gradDirectionSelect.value = btn.dataset.dir || 'linear-diag';
      }
      generateQRCode();
    });
  });

  // Event Listeners for inputs
  qrTextInput.addEventListener('input', () => {
    charCountSpan.textContent = qrTextInput.value.length;
    generateQRCode();
  });
  
  moduleStyleSelect.addEventListener('change', generateQRCode);
  eccLevelSelect.addEventListener('change', generateQRCode);
  
  borderSizeInput.addEventListener('input', (e) => {
    borderValueSpan.textContent = e.target.value;
    generateQRCode();
  });
  
  borderStyleSelect.addEventListener('change', generateQRCode);
  
  gradDirectionSelect.addEventListener('change', generateQRCode);

  // Generate path data based on selected module style
  function generatePathData(qr, border, style) {
    const parts = [];
    const r = 0.24; // Corner radius ratio for rounded squares

    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.getModule(x, y)) {
          const px = x + border;
          const py = y + border;
          
          if (style === 'circle') {
            // Draw circle center: px + 0.5, py + 0.5
            parts.push(`M ${px} ${py + 0.5} a 0.5 0.5 0 1 0 1 0 a 0.5 0.5 0 1 0 -1 0`);
          } else if (style === 'rounded') {
            // Draw rounded square path
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
            );
          } else {
            // Classic square
            parts.push(`M${px},${py}h1v1h-1z`);
          }
        }
      }
    }
    return parts.join(' ');
  }

  // Generate QR Code SVG XML
  function generateQRCode() {
    const text = qrTextInput.value || ' ';
    const border = parseInt(borderSizeInput.value, 10);
    const style = moduleStyleSelect.value;
    const borderStyle = borderStyleSelect.value;
    
    // ECC Level mapping
    let ecc;
    switch (eccLevelSelect.value) {
      case 'LOW': ecc = QRC.Ecc.LOW; break;
      case 'MEDIUM': ecc = QRC.Ecc.MEDIUM; break;
      case 'QUARTILE': ecc = QRC.Ecc.QUARTILE; break;
      case 'HIGH': ecc = QRC.Ecc.HIGH; break;
      default: ecc = QRC.Ecc.MEDIUM;
    }

    try {
      const qr = QRC.encodeText(text, ecc);
      
      // Update Info badges
      infoSizeSpan.textContent = `${qr.size}x${qr.size}`;
      infoVersionSpan.textContent = qr.version;

      const pathData = generatePathData(qr, border, style);
      const size = qr.size + border * 2;

      // Color/Gradient Definitions
      let defs = '';
      let fillAttr = '';
      let bgFill = bgColorInput.value;

      if (colorMode === 'gradient') {
        const startColor = gradStartInput.value;
        const endColor = gradEndInput.value;
        const dir = gradDirectionSelect.value;
        
        bgFill = '#FFFFFF'; // Force clean background for gradient QR code templates

        if (dir === 'radial') {
          defs = `
            <defs>
              <radialGradient id="qr-grad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stop-color="${startColor}" />
                <stop offset="100%" stop-color="${endColor}" />
              </radialGradient>
            </defs>`;
        } else {
          let coords = '';
          if (dir === 'linear-lr') {
            coords = 'x1="0%" y1="0%" x2="100%" y2="0%"';
          } else if (dir === 'linear-tb') {
            coords = 'x1="0%" y1="0%" x2="0%" y2="100%"';
          } else { // linear-diag
            coords = 'x1="0%" y1="0%" x2="100%" y2="100%"';
          }
          defs = `
            <defs>
              <linearGradient id="qr-grad" ${coords}>
                <stop offset="0%" stop-color="${startColor}" />
                <stop offset="100%" stop-color="${endColor}" />
              </linearGradient>
            </defs>`;
        }
        fillAttr = 'url(#qr-grad)';
      } else {
        fillAttr = qrColorInput.value;
      }

      let extraBorderRect = '';
      if (borderStyle === 'rounded') {
        const strokeColor = colorMode === 'gradient' ? 'url(#qr-grad)' : qrColorInput.value;
        const rxVal = border > 0 ? Math.min(2, border * 0.5) : 1;
        extraBorderRect = `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="${rxVal}" fill="none" stroke="${strokeColor}" stroke-width="0.25"/>`;
      }

      currentSvgString = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${size} ${size}" stroke="none" width="450" height="450">
        ${defs}
        <rect width="100%" height="100%" fill="${bgFill}"/>
        <path d="${pathData}" fill="${fillAttr}"/>
        ${extraBorderRect}
      </svg>`;

      svgContainer.innerHTML = currentSvgString;
      
      // Update preview card background style dynamically
      previewCard.style.backgroundColor = bgFill;
    } catch (e) {
      console.error(e);
      svgContainer.innerHTML = `<span style="color: var(--secondary); font-size: 0.85rem; text-align: center;">텍스트 양이 너무 많습니다. 오류 정정 레벨을 낮추거나 텍스트를 줄여주세요.</span>`;
    }
  }

  // Download SVG
  downloadSvgBtn.addEventListener('click', () => {
    if (!currentSvgString) return;
    
    const blob = new Blob([currentSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Download PNG (by rendering to canvas)
  downloadPngBtn.addEventListener('click', () => {
    if (!currentSvgString) return;

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    // Parse viewBox to get natural size
    const viewBox = svgElement.getAttribute('viewBox').split(' ');
    const size = parseInt(viewBox[2], 10);
    
    // Scale up for high-res PNG (e.g., 1024x1024)
    const exportSize = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');

    const svgBlob = new Blob([currentSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `qrcode_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

  // Initial generation
  generateQRCode();
  charCountSpan.textContent = qrTextInput.value.length;
});
