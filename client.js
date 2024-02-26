#!/usr/bin/env node
const HyperDHT = require('hyperdht')
const net = require('net')
const argv = require('minimist')(process.argv.slice(2))
const b4a = require('b4a')
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const goodbye = require('graceful-goodbye')
const connPiper = libNet.connPiper
const SecureKey = require('secure-key')

async function main () {
  const helpMsg = 'Usage:\nhypertele -p port_listen -u unix_socket ?--address service_address ?-c conf.json ?-i identity.json ?-s peer_key ?--private ?--key-file ?--key-file-password'

  if (argv.help) {
    console.log(helpMsg)
    process.exit(-1)
  }

  if (!argv.u && argv.p == null) {
    console.error('Error: proxy port invalid')
    process.exit(-1)
  }

  if (argv.u && argv.p) {
    console.error('Error: cannot listen to both a port and a Unix domain socket')
    process.exit(-1)
  }
  const conf = {}
  conf.private = argv.private != null

  const target = argv.u ? argv.u : +argv.p

  const keyPair = await getKeyPair(argv, conf)

  // Unofficial opt, only used for tests
  let bootstrap = null
  if (argv.bootstrap) {
    bootstrap = [{ host: '127.0.0.1', port: argv.bootstrap }]
  }

  if (conf.private) {
    conf.peer = keyPair.publicKey
  } else if (argv.s) {
    conf.peer = libUtils.resolveHostToKey([], argv.s)
  }

  if (argv.c) {
    libUtils.readConf(conf, argv.c)
  }

  if (!conf.keepAlive) {
    conf.keepAlive = 5000
  }

  if (argv.compress) {
    conf.compress = true
  }

  const peer = conf.peer
  if (!peer) {
    console.error('Error: peer is invalid')
    process.exit(-1)
  }

  const debug = argv.debug

  const stats = {}

  const dht = new HyperDHT({
    bootstrap,
    keyPair
  })

  const proxy = net.createServer({ allowHalfOpen: true }, c => {
    return connPiper(c, () => {
      const stream = dht.connect(Buffer.from(peer, 'hex'), { reusableSocket: true })
      stream.setKeepAlive(conf.keepAlive)

      return stream
    }, { compress: conf.comgetKeyPairpress }, stats)
  })

  if (debug) {
    setInterval(() => {
      console.log('connection stats', stats)
    }, 5000)
  }

  if (argv.u) {
    proxy.listen(target, () => {
      console.log(`Server ready @${target}`)
    })
  } else {
    const targetHost = argv.address || '127.0.0.1'
    proxy.listen(target, targetHost, () => {
      const { address, port } = proxy.address()
      console.log(`Server ready @${address}:${port}`)
    })
  }

  goodbye(async () => {
    await dht.destroy()
  })
}

async function getKeyPair (argv, conf) {
  if (argv['key-file']) {
    if (argv.s && conf.private) throw new Error('key-file is not compatible with -s(eed) in private mode, since it uses the keys in the key-file instead of the seed')

    const password = argv['key-file-password']
      ? b4a.from(argv['key-file-password'])
      : null // read from stdin if not specified

    const secureKeyPair = await SecureKey.open(argv['key-file'], { password })

    secureKeyPair.unlock()
    const keyPair = {
      publicKey: b4a.from(secureKeyPair.publicKey),
      secretKey: b4a.from(secureKeyPair.secretKey)
    }
    secureKeyPair.lock()
    secureKeyPair.clear()

    return keyPair
  }

  if (argv.i && conf.private) {
    throw new Error('The --private flag is not compatible with the -i(dentity) flag, since the identity is derived from the peer key')
  }

  let keyPair = null

  if (argv.i) {
    keyPair = libUtils.resolveIdentity([], argv.i)

    if (!keyPair) {
      console.error('Error: identity file invalid')
      process.exit(-1)
    }

    keyPair = libKeys.parseKeyPair(keyPair)
  }

  if (conf.private) {
    const seed = argv.s
    keyPair = HyperDHT.keyPair(b4a.from(seed, 'hex'))
  }

  return keyPair
}

main().catch(console.error)
