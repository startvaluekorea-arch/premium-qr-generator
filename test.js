import qrcodegen from 'nayuki-qr-code-generator';

const QRC = qrcodegen.QrCode;
const qr = QRC.encodeText("Hello, World!", QRC.Ecc.MEDIUM);

console.log("QR Code Size:", qr.size);
console.log("Module at (0, 0):", qr.getModule(0, 0));
