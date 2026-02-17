export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Consume and discard the incoming stream (multipart data)
    for await (const _chunk of req) {
      // no-op
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'failed to receive upload' });
  }
}
