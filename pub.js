#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const connRemoteCtrl = libNet.connRemoteCtrl

const helpMsg = `Usage:\nhypertele-pub -l port_local ?-c conf.json ?--seed seed`

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
const clients = {

}

const local = net.createServer((socket) => {
  socket.on('data', d => {
    const rks = Object.keys(clients)

    rks.forEach(rk => {
      const c = clients[rk]
      c.send(d)
    })
  }) 
})

local.listen(+argv.l, '0.0.0.0')

const server = dht.createServer({
  firewall: (remotePublicKey, remoteHandshakePayload)=> {
    if (conf.allow && !libKeys.checkAllowList(conf.allow, remotePublicKey)) {
      return true
    }

    return false
  },
  reusableSocket: true
}, c => {
  const rk = c.remotePublicKey
  const ops = connRemoteCtrl(c, {
    onDestroy: () => {
      delete clients[rk]
    },
    debug: debug
  }, stats)

  clients[rk] = ops
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
