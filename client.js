#!/usr/bin/env node
const HyperDHT = require('hyperdht')
const net = require('net')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const connPiper = libNet.connPiper

const helpMsg = 'Usage:\nhypertele -p port_listen -u unix_socket ?--address service_address ?-c conf.json ?-i identity.json ?-s peer_key'

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (!argv.u && !+argv.p) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

if (argv.u && argv.p) {
  console.error('Error: cannot listen to both a port and a Unix domain socket')
  process.exit(-1)
}
const conf = {}

const target = argv.u ? argv.u : +argv.p

if (argv.s) {
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

let keyPair = null
if (argv.i) {
  keyPair = libUtils.resolveIdentity([], argv.i)

  if (!keyPair) {
    console.error('Error: identity file invalid')
    process.exit(-1)
  }

  keyPair = libKeys.parseKeyPair(keyPair)
}

const stats = {}

const dht = new HyperDHT({
  keyPair
})

const proxy = net.createServer({ allowHalfOpen: true }, c => {
  return connPiper(c, () => {
    const stream = dht.connect(Buffer.from(peer, 'hex'), { reusableSocket: true })
    stream.setKeepAlive(conf.keepAlive)

    return stream
  }, { compress: conf.compress }, stats)
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
    console.log(`Server ready @${targetHost}:${target}`)
  })
}

process.once('SIGINT', () => {
  dht.destroy().then(() => {
    process.exit()
  })
})
