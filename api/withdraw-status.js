const KEY = 'funds_withdrawn'

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

async function readWithdrawRecord() {
  const config = getRedisConfig()
  if (!config) return null

  const res = await fetch(`${config.url}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${config.token}` },
  })

  if (!res.ok) return null

  const data = await res.json()
  if (!data.result) return null

  try {
    return JSON.parse(data.result)
  } catch {
    return null
  }
}

async function writeWithdrawRecord(record) {
  const config = getRedisConfig()
  if (!config) return false

  const res = await fetch(
    `${config.url}/set/${KEY}/${encodeURIComponent(JSON.stringify(record))}`,
    {
      headers: { Authorization: `Bearer ${config.token}` },
    },
  )

  return res.ok
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const record = await readWithdrawRecord()
      return res.status(200).json({ withdrawn: Boolean(record), record })
    } catch {
      return res.status(200).json({ withdrawn: false, record: null })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const saved = await writeWithdrawRecord(body || { at: Date.now() })
      if (!saved) {
        return res.status(503).json({ ok: false, error: 'Storage unavailable' })
      }
      return res.status(200).json({ ok: true })
    } catch {
      return res.status(500).json({ ok: false })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
