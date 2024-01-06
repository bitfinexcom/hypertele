const { spawn } = require('child_process')
const { once } = require('events')
const path = require('path')
const http = require('http')
const createTestnet = require('hyperdht/testnet')
const test = require('brittle')
const HyperDHT = require('hyperdht')
const b4a = require('b4a')

const MAIN_DIR = path.dirname(__dirname)
const SERVER_EXECUTABLE = path.join(MAIN_DIR, 'server.js')
const CLIENT_EXECUTABLE = path.join(MAIN_DIR, 'client.js')

test('Can proxy in private mode', async t => {
  const { bootstrap } = await createTestnet(3, t.teardown)
  const portToProxy = await setupDummyServer(t.teardown)
  const seed = 'a'.repeat(64)

  await setupHyperteleServer(portToProxy, seed, bootstrap, t, { isPrivate: true })
  const clientPort = await setupHyperteleClient(seed, bootstrap, t, { isPrivate: true })

  const res = await request(clientPort)
  t.is(res.data, 'You got served', 'Proxy works')
})

test('Cannot access private-mode server with public key', async t => {
  const { bootstrap } = await createTestnet(3, t.teardown)
  const portToProxy = await setupDummyServer(t.teardown)
  const seed = 'a'.repeat(64)
  const keypair = HyperDHT.keyPair(b4a.from(seed, 'hex'))
  const pubKey = b4a.toString(keypair.publicKey, 'hex')

  await setupHyperteleServer(portToProxy, seed, bootstrap, t, { isPrivate: true })
  const clientPort = await setupHyperteleClient(pubKey, bootstrap, t, { isPrivate: false })

  // Could also be a socket hangup if more time is given
  await t.exception(async () => await request(clientPort), /Request timeout/)
})

test('Can proxy in non-private mode', async t => {
  const { bootstrap } = await createTestnet(3, t.teardown)
  const portToProxy = await setupDummyServer(t.teardown)
  const seed = 'a'.repeat(64)
  const keypair = HyperDHT.keyPair(b4a.from(seed, 'hex'))
  const pubKey = b4a.toString(keypair.publicKey, 'hex')

  await setupHyperteleServer(portToProxy, seed, bootstrap, t, { isPrivate: false })
  const clientPort = await setupHyperteleClient(pubKey, bootstrap, t, { isPrivate: false })

  const res = await request(clientPort)
  t.is(res.data, 'You got served', 'Proxy works')
})

async function setupDummyServer (teardown) {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end('You got served')
  })
  teardown(() => server.close())

  server.listen({ port: 0, host: '127.0.0.1' })
  await once(server, 'listening')
  return server.address().port
}

async function setupHyperteleServer (portToProxy, seed, bootstrap, t, { isPrivate = false } = {}) {
  const args = [
    SERVER_EXECUTABLE,
    '-l',
    portToProxy,
    '--seed',
    seed,
    '--bootstrap',
    bootstrap[0].port
  ]
  if (isPrivate) args.push('--private')

  const setupServer = spawn('node', args)
  t.teardown(() => setupServer.kill('SIGKILL'))

  setupServer.stderr.on('data', (data) => {
    console.error(data.toString())
    t.fail('Failed to setup hypertele server')
  })

  await new Promise(resolve => {
    setupServer.stdout.on('data', (data) => {
      if (data.includes('hypertele')) {
        resolve()
      }
    })
  })
}

async function setupHyperteleClient (seed, bootstrap, t, { isPrivate = false } = {}) {
  const args = [
    CLIENT_EXECUTABLE,
    '-p',
    0, // random
    '-s',
    seed,
    '--bootstrap',
    bootstrap[0].port
  ]
  if (isPrivate) args.push('--private')

  const setupClient = spawn('node', args)
  t.teardown(() => setupClient.kill('SIGKILL'))

  setupClient.stderr.on('data', (data) => {
    console.error(data.toString())
    t.fail('Failed to setup hypertele client')
  })

  const clientPort = await new Promise(resolve => {
    setupClient.stdout.on('data', (data) => {
      const msg = data.toString()
      if (msg.includes('Server ready')) {
        const port = msg.slice(msg.search(':') + 1)
        resolve(port)
      }
    })
  })

  return clientPort
}

async function request (port, { msTimeout = 500 } = {}) {
  const link = `http://127.0.0.1:${port}`

  return new Promise((resolve, reject) => {
    const req = http.get(link, {
      headers: {
        Connection: 'close'
      }
    })

    req.setTimeout(msTimeout,
      () => {
        reject(new Error('Request timeout'))
        req.destroy()
      }
    )

    req.on('error', reject)
    req.on('response', function (res) {
      let buf = ''

      res.setEncoding('utf-8')

      res.on('data', function (data) {
        buf += data
      })

      res.on('end', function () {
        resolve({ status: res.statusCode, data: buf })
      })
    })
  })
}
