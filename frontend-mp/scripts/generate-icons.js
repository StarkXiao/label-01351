// scripts/generate-icons.js
// 生成 tabBar 图标的脚本
// 运行: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const iconsDir = path.join(__dirname, '..', 'assets', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function createPng(width, height, colorR, colorG, colorB) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = createChunk('IHDR', ihdrData);
  
  const scanlineLength = width * 3 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);
  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, y * scanlineLength);
    for (let x = 0; x < width; x++) {
      const offset = y * scanlineLength + 1 + x * 3;
      rawData.writeUInt8(colorR, offset);
      rawData.writeUInt8(colorG, offset + 1);
      rawData.writeUInt8(colorB, offset + 2);
    }
  }
  
  const compressedData = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressedData);
  
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const grayPng = createPng(81, 81, 153, 153, 153);
const greenPng = createPng(81, 81, 76, 175, 80);

fs.writeFileSync(path.join(iconsDir, 'qa.png'), grayPng);
fs.writeFileSync(path.join(iconsDir, 'qa-active.png'), greenPng);

console.log('图标生成成功！');
console.log('灰色图标:', path.join(iconsDir, 'qa.png'));
console.log('绿色图标:', path.join(iconsDir, 'qa-active.png'));
