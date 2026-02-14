import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const { name } = req.query
  if (!name) return res.status(400).end('missing image name')
  if (name.includes('..')) return res.status(400).end('invalid name')

  // image is stored at workspace root (one level above the frontend project)
  const filePath = path.join(process.cwd(), '..', name)

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return res.status(404).end('not found')
    const stream = fs.createReadStream(filePath)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    // basic content-type guess by extension
    if (name.toLowerCase().endsWith('.png')) res.setHeader('Content-Type', 'image/png')
    else if (name.toLowerCase().endsWith('.webp')) res.setHeader('Content-Type', 'image/webp')
    else res.setHeader('Content-Type', 'image/jpeg')
    stream.pipe(res)
  })
}
