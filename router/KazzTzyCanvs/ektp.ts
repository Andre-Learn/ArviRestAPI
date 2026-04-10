import { Request, Response } from "express"
import * as Canvas from "canvas"
import assets from "@putuofc/assetsku"


async function generateEktp(data: any) {

  Canvas.registerFont(assets.font.get("ARRIAL"), { family: "Arial" })
  Canvas.registerFont(assets.font.get("OCR"), { family: "Ocr" })
  Canvas.registerFont(assets.font.get("SIGN"), { family: "Sign" })

  const template = await Canvas.loadImage(assets.image.get("TEMPLATE"))

  const pasPhoto = await Canvas.loadImage(data.pas_photo)

  const width = 850
  const height = 530
  const radius = 20

  const canvas = Canvas.createCanvas(width, height)
  const ctx = canvas.getContext("2d")


  ctx.fillStyle = "#F0F0F0"
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(width - radius, 0)
  ctx.quadraticCurveTo(width, 0, width, radius)
  ctx.lineTo(width, height - radius)
  ctx.quadraticCurveTo(width, height, width - radius, height)
  ctx.lineTo(radius, height)
  ctx.quadraticCurveTo(0, height, 0, height - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fill()

  ctx.drawImage(template, 0, 0, width, height)


  ctx.fillStyle = "black"
  ctx.font = "bold 25px Arial"
  ctx.textAlign = "center"
  ctx.fillText(`PROVINSI ${data.provinsi.toUpperCase()}`, width / 2, 45)
  ctx.fillText(`${data.kota.toUpperCase()}`, width / 2, 75)

  ctx.textAlign = "left"
  ctx.font = "35px Ocr"
  ctx.fillText(data.nik, 205, 140)

  ctx.font = "bold 20px Arial"
  const valueX = 225
  ctx.fillText(data.nama.toUpperCase(), valueX, 180)
  ctx.fillText(data.ttl.toUpperCase(), valueX, 205)
  ctx.fillText(data.jenis_kelamin.toUpperCase(), valueX, 230)
  ctx.fillText(data.golongan_darah.toUpperCase(), 550, 230)
  ctx.fillText(data.alamat.toUpperCase(), valueX, 255)
  ctx.fillText(data.rt_rw.toUpperCase(), valueX, 282)
  ctx.fillText(data.kel_desa.toUpperCase(), valueX, 307)
  ctx.fillText(data.kecamatan.toUpperCase(), valueX, 332)
  ctx.fillText(data.agama.toUpperCase(), valueX, 358)
  ctx.fillText(data.status.toUpperCase(), valueX, 383)
  ctx.fillText(data.pekerjaan.toUpperCase(), valueX, 409)
  ctx.fillText(data.kewarganegaraan.toUpperCase(), valueX, 434)
  ctx.fillText(data.masa_berlaku.toUpperCase(), valueX, 459)


  const photoX = 635
  const photoY = 150
  const photoWidth = 180
  const photoHeight = 240

  const photoCanvas = Canvas.createCanvas(photoWidth, photoHeight)
  const photoCtx = photoCanvas.getContext("2d")

  photoCtx.fillStyle = "#FF0000"
  photoCtx.fillRect(0, 0, photoWidth, photoHeight)

  const aspectRatio = pasPhoto.width / pasPhoto.height
  let srcWidth, srcHeight, srcX, srcY

  if (aspectRatio > photoWidth / photoHeight) {
    srcHeight = pasPhoto.height
    srcWidth = srcHeight * (photoWidth / photoHeight)
    srcX = (pasPhoto.width - srcWidth) / 2
    srcY = 0
  } else {
    srcWidth = pasPhoto.width
    srcHeight = srcWidth * (photoHeight / photoWidth)
    srcX = 0
    srcY = (pasPhoto.height - srcHeight) / 2
  }

  photoCtx.drawImage(pasPhoto, srcX, srcY, srcWidth, srcHeight, 0, 0, photoWidth, photoHeight)
  ctx.drawImage(photoCanvas, photoX, photoY, photoWidth, photoHeight)


  ctx.textAlign = "center"
  ctx.font = "16px Arial"
  ctx.fillText(data.kota.toUpperCase(), photoX + photoWidth / 2, photoY + photoHeight + 35)
  ctx.fillText(data.terbuat, photoX + photoWidth / 2, photoY + photoHeight + 60)

  const signName = data.nama.split(" ")[0]
  ctx.font = "36px Sign"
  ctx.fillText(signName, photoX + photoWidth / 2, photoY + photoHeight + 110)

  return canvas.toBuffer("image/png", { quality: 0.95 })
}


export default async function ektpHandler(req: Request, res: Response) {

  const {
    provinsi, kota, nik, nama, ttl, jenis_kelamin, 
    golongan_darah, alamat, kecamatan, agama, 
    status, pekerjaan, kewarganegaraan, masa_berlaku, 
    terbuat, pas_photo
  } = req.query


  if (!nik || !nama || !pas_photo) {
    return res.status(400).json({
      status: false,
      message: "Parameter NIK, Nama, dan Pas Photo wajib diisi."
    })
  }

  try {

    const buffer = await generateEktp({
      provinsi: provinsi || "JAWA TENGAH",
      kota: kota || "KABUPATEN SEMARANG",
      nik,
      nama,
      ttl: ttl || "SEMARANG, 01-01-2000",
      jenis_kelamin: jenis_kelamin || "LAKI-LAKI",
      golongan_darah: golongan_darah || "-",
      alamat: alamat || "JL. MAWAR NO. 1",
      rt_rw: req.query["rt/rw"] || "001/001",
      kel_desa: req.query["kel/desa"] || "DESA MAWAR",
      kecamatan: kecamatan || "KEC. MAWAR",
      agama: agama || "ISLAM",
      status: status || "BELUM KAWIN",
      pekerjaan: pekerjaan || "PELAJAR/MAHASISWA",
      kewarganegaraan: kewarganegaraan || "WNI",
      masa_berlaku: masa_berlaku || "SEUMUR HIDUP",
      terbuat: terbuat || "01-01-2024",
      pas_photo: pas_photo as string
    })

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat gambar e-KTP"
    })
  }
}