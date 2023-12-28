#!/usr/bin/env node
const HyperDHT = require('hyperdht')
const net = require('net')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const goodbye = require('graceful-goodbye')
const connRemoteCtrl = libNet.connRemoteCtrl

const helpMsg = 'Usage:\nhypertele-pub -l port_local ?-c conf.json ?--seed seed'

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

if (argv.compress) {
  conf.compress = true
}

if (argv['cert-skip']) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
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

const stats = { cid: 0 }
const clients = {}

const local = net.createServer((socket) => {
  socket.on('data', d => {
    const cids = Object.keys(clients)

    cids.forEach(cid => {
      const c = clients[cid]
      c.send(d)
    })
  })
})

local.listen(+argv.l, '0.0.0.0')

const server = dht.createServer({
  firewall: (remotePublicKey, remoteHandshakePayload) => {
    if (conf.allow && !libKeys.checkAllowList(conf.allow, remotePublicKey)) {
      return true
    }

    return false
  },
  reusableSocket: true
}, c => {
  const cid = stats.cid++

  const ops = connRemoteCtrl(c, {
    onDestroy: () => {
      delete clients[cid]
    },
    debug,
    isServer: true,
    compress: conf.compress
  }, stats)

  clients[cid] = ops
})

server.listen(keyPair).then(() => {
  console.log('hypertele:', keyPair.publicKey.toString('hex'))
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

goodbye(async () => {
  await new Promise(resolve => {
    local.close(resolve)
  })
  await dht.destroy()
})
