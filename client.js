#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const connHandler = require('./lib.js').connHandler

const helpMsg = 'Usage:\nhyperproxy -p port_listen -c conf.json -k keypair.json -s server_key'

if (argv.gen_keypair) {
  const kp = HyperDHT.keyPair()
  const file = argv.gen_keypair || 'keypair.json'
  fs.writeFileSync(file, storeKeyPair(kp))
  console.log('Public Key:', kp.publicKey.toString('hex'))
  process.exit(-1)
}

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (!+argv.p) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

if (!argv.c) {
  console.error('Error: conf invalid')
  process.exit(-1)
}

let conf = null

try {
  conf = JSON.parse(fs.readFileSync(argv.c))
} catch (e) {
  console.error(e)
  process.exit(-1)
}

const peer = argv.s || conf.peer
if (!peer) {
  console.error('Error: peer is invalid')
  process.exit(-1)
}

const debug = argv.debug

const keyfile = argv.k || conf.keyfile
const dht = new HyperDHT({
  keyPair: keyfile && parseKeyPair(fs.readFileSync(keyfile))
})

const stats = {}

const proxy = net.createServer({ allowHalfOpen: true }, c => {
  return connHandler(c, () => {
    return dht.connect(Buffer.from(peer, 'hex'))
  }, {}, stats)
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

const keyfile = argv.k || conf.keyfile
proxy.listen(+argv.p, () => {
  console.log(`Server ready @${argv.p}`)
})

process.once('SIGINT', () => {
  dht.destroy().then(() => {
    process.exit()
  })
})

function parseKeyPair (k) {
  const kp = JSON.parse(k)
  return {
    secretKey: Buffer.from(kp.secretKey, 'hex'),
    publicKey: Buffer.from(kp.publicKey, 'hex')
  }
}

function storeKeyPair (k) {
  return JSON.stringify({
    secretKey: k.secretKey.toString('hex'),
    publicKey: k.publicKey.toString('hex')
  })
}
