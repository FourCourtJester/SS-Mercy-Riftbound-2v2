// Trim an 8-bit RGBA PNG to the bounding box of its visible pixels (alpha > 8), plus
// padding. No dependencies -- just node:zlib -- because no image tools are installed
// here. This is how public/brand/logo.png and mercy.png were made from the originals.
//
//   node scripts/trim-png.mjs public/2v2InviteText.png public/brand/logo.png 4
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync, deflateSync, crc32 } from 'node:zlib'

const [, , input, output, padArg = '8'] = process.argv
const pad = Number(padArg)
const buf = readFileSync(input)
let pos = 8
let width, height, depth, colorType
const idat = []
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos)
  const type = buf.toString('ascii', pos + 4, pos + 8)
  const data = buf.subarray(pos + 8, pos + 8 + len)
  if (type === 'IHDR') {
    width = data.readUInt32BE(0)
    height = data.readUInt32BE(4)
    depth = data[8]
    colorType = data[9]
  } else if (type === 'IDAT') idat.push(data)
  pos += 12 + len
}
if (depth !== 8 || colorType !== 6) throw new Error(`need 8-bit RGBA, got depth ${depth} type ${colorType}`)

const bpp = 4
const stride = width * bpp
const raw = inflateSync(Buffer.concat(idat))
const px = Buffer.alloc(height * stride)
for (let y = 0; y < height; y++) {
  const f = raw[y * (stride + 1)]
  const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
  for (let x = 0; x < stride; x++) {
    const a = x >= bpp ? px[y * stride + x - bpp] : 0
    const b = y > 0 ? px[(y - 1) * stride + x] : 0
    const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0
    let v = line[x]
    if (f === 1) v += a
    else if (f === 2) v += b
    else if (f === 3) v += (a + b) >> 1
    else if (f === 4) {
      const p = a + b - c
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
      v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
    }
    px[y * stride + x] = v & 255
  }
}

let x0 = width, y0 = height, x1 = -1, y1 = -1
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++)
    if (px[y * stride + x * 4 + 3] > 8) {
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad)
x1 = Math.min(width - 1, x1 + pad); y1 = Math.min(height - 1, y1 + pad)
const w = x1 - x0 + 1, h = y1 - y0 + 1

const out = Buffer.alloc(h * (w * 4 + 1))
for (let y = 0; y < h; y++) {
  out[y * (w * 4 + 1)] = 0
  px.copy(out, y * (w * 4 + 1) + 1, (y + y0) * stride + x0 * 4, (y + y0) * stride + (x1 + 1) * 4)
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0)
  return Buffer.concat([len, td, crc])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6
writeFileSync(output, Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr), chunk('IDAT', deflateSync(out, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]))
console.log(`${input}: ${width}x${height} -> ${w}x${h} (crop ${x0},${y0})`)
