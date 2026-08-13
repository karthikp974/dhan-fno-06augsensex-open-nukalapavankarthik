const KEY = 'funds_withdrawn'

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

async function redisCommand(command) {
  const config = getRedisConfig()
  if (!config) return null

  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })

  if (!res.ok) return null

  const data = await res.json()
  return data.result ?? null
}

async function readWithdrawRecord() {
  const result = await redisCommand(['GET', KEY])
  if (!result) return null

  try {
    return JSON.parse(result)
  } catch {
    return null
  }
}

async function writeWithdrawRecord(record) {
  const result = await redisCommand(['SET', KEY, JSON.stringify(record)])
  return result === 'OK'
}

async function readRequestBody(req) {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body)
      } catch {
        return null
      }
    }
    return req.body
  }

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  if (!chunks.length) return null

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
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
      const body = await readRequestBody(req)
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
