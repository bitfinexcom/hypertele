#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const connHandler = libNet.connHandler

const helpMsg = `Usage:\nhypertele-server -l port_local ?-c conf.json ?--seed seed ?--cert-skip`

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
  libUtils.readConf(conf, argv.c)
}

if (argv['cert-skip']) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
}

if (!conf.seed) {
  console.error('Error: conf.seed invalid')
  process.exit(-1)
}

if (conf.allow) {
  conf.allow = libKeys.prepKeyList(conf.allow)
}

const debug = argv.debug

const seed = Buffer.from(conf.seed, 'hex')

const dht = new HyperDHT()
const keyPair = HyperDHT.keyPair(seed)

const stats = {}

const server = dht.createServer({ reusableSocket: true }, c => {
  return connHandler(c, () => {
    if (conf.allow && !libKeys.checkAllowList(conf.allow, c.remotePublicKey)) {
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
