#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libKeys = require('@hyper-cmd/lib-keys')
const connHandler = libNet.connHandler

const helpMsg = 'Usage:\nhypertele -p port_listen -c conf.json -k keypair.json -s peer_key'

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (!+argv.p) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

const conf = {}

if (argv.s) {
  conf.peer = argv.s
}

if (argv.c) {
  let cf = null

  try {
    cf = JSON.parse(fs.readFileSync(argv.c))
  } catch (e) {
    console.error('Error: conf file invalid', e)
    process.exit(-1)
  }

  for (const k in cf) {
    conf[k] = cf[k]
  }
}

const peer = conf.peer
if (!peer) {
  console.error('Error: peer is invalid')
  process.exit(-1)
}

const debug = argv.debug

const keyfile = argv.k || conf.keyfile
const dht = new HyperDHT({
  keyPair: keyfile && libKeys.parseKeyPair(fs.readFileSync(keyfile))
})

const stats = {}

const proxy = net.createServer({ allowHalfOpen: true }, c => {
  return connHandler(c, () => {
    return dht.connect(Buffer.from(peer, 'hex'), { reusableSocket: true })
  }, {}, stats)
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

proxy.listen(+argv.p, () => {
  console.log(`Server ready @${argv.p}`)
})

process.once('SIGINT', () => {
  dht.destroy().then(() => {
    process.exit()
  })
})
