#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const connHandler = require('./lib.js').connHandler

const helpMsg = `Usage:\nhypertele-server -l port_local ?-c conf.json ?--seed seed ?--cert-skip
hypertele-server --gen_seed`

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (!+argv.l) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

const conf = {}

if (argv.seed) {
  conf.seed = argv.seed
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

if (argv['cert-skip']) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
}

if (!conf.seed) {
  console.error('Error: conf.seed invalid')
  process.exit(-1)
}

let allow = null
if (conf.allow) {
  allow = conf.allow.map(pk => Buffer.from(pk, 'hex'))
}

const debug = argv.debug

const seed = Buffer.from(conf.seed, 'hex')

const dht = new HyperDHT()
const keyPair = HyperDHT.keyPair(seed)

const stats = {}

const server = dht.createServer({ reusableSocket: true }, c => {
  return connHandler(c, () => {
    if (allow !== null && !lib.findBuf(allow, c.remotePublicKey)) {
      return null
    }
    return net.connect({ port: +argv.l, host: '127.0.0.1', allowHalfOpen: true })
  }, { debug: debug }, stats)
})

server.listen(keyPair).then(() => {
  console.log('hypertele:', keyPair.publicKey.toString('hex'))
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

process.once('SIGINT', function () {
  dht.destroy()
})
