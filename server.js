#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const sodium = require('sodium-universal')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const connHandler = require('./lib.js').connHandler

const helpMsg = `Usage:\nhyperproxy-server -l port_local -c conf.json ?-k
hyperproxy-server --gen_seed`

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (argv.gen_seed) {
  console.log('Init Seed:', randomBytes(32).toString('hex'))
  process.exit(-1)
}

if (!+argv.l) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

if (!argv.c) {
  console.error('Error: conf invalid')
  process.exit(-1)
}

if (argv.k) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
}

let conf = null

try {
  conf = JSON.parse(fs.readFileSync(argv.c))
} catch (e) {
  console.error(e)
  process.exit(-1)
}

if (!conf.seed) {
  console.error('Error: conf.seed invalid')
  process.exit(-1)
}

const debug = argv.debug

if (debug) {
  require('heapdump')
}

const seed = Buffer.from(conf.seed, 'hex')

const dht = new HyperDHT()
const keyPair = HyperDHT.keyPair(seed)

const stats = {}

const server = dht.createServer(c => {
  return connHandler(c, () => {
    return net.connect({ port: +argv.l, host: '127.0.0.1', allowHalfOpen: true })
  }, { debug: debug }, stats)
})

server.listen(keyPair).then(() => {
  console.log('hyperproxy:', keyPair.publicKey.toString('hex'))
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

process.once('SIGINT', function () {
  dht.destroy()
})

function randomBytes (n) {
  const b = Buffer.alloc(n)
  sodium.randombytes_buf(b)
  return b
}
