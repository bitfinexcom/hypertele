#!/usr/bin/env node
const HyperDHT = require('hyperdht')
const net = require('net')
const b4a = require('b4a')
const argv = require('minimist')(process.argv.slice(2))
const libNet = require('@hyper-cmd/lib-net')
const libUtils = require('@hyper-cmd/lib-utils')
const libKeys = require('@hyper-cmd/lib-keys')
const goodbye = require('graceful-goodbye')
const connPiper = libNet.connPiper

const helpMsg = 'Usage:\nhypertele-server -l service_port -u unix_socket ?--address service_address ?-c conf.json ?--seed seed ?--cert-skip ?--private'

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}

if (!argv.u && !+argv.l) {
  console.error('Error: proxy port invalid')
  process.exit(-1)
}

if (argv.u && argv.l) {
  console.error('Error: cannot listen to both a port and a Unix domain socket')
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

conf.private = false
if (argv.private) {
  if (conf.allow) throw new Error('--private flag is not compatible with an allow list, as the private key derived from the seed is the capability')
  conf.private = true
}

// Unofficial opt, only used for tests
let bootstrap = null
if (argv.bootstrap) {
  bootstrap = [{ host: '127.0.0.1', port: argv.bootstrap }]
}

const debug = argv.debug

const seed = Buffer.from(conf.seed, 'hex')

const dht = new HyperDHT({ bootstrap })
const keyPair = HyperDHT.keyPair(seed)

const stats = {}

const destIp = argv.address || '127.0.0.1'

const privateFirewall = (remotePublicKey) => {
  return !b4a.equals(remotePublicKey, keyPair.publicKey)
}

const allowListFirewall = (remotePublicKey, remoteHandshakePayload) => {
  if (conf.allow && !libKeys.checkAllowList(conf.allow, remotePublicKey)) {
    return true
  }

  return false
}

const firewall = conf.private ? privateFirewall : allowListFirewall

const server = dht.createServer({
  firewall,
  reusableSocket: true
}, c => {
  connPiper(c, () => {
    return net.connect(
      argv.u
        ? { path: argv.u }
        : { port: +argv.l, host: destIp, allowHalfOpen: true }
    )
  }, { debug, isServer: true, compress: conf.compress }, stats)
})

server.listen(keyPair).then(() => {
  if (conf.private) {
    console.log(`hypertele (private): connect with seed ${b4a.toString(seed, 'hex')} (listening on ${b4a.toString(keyPair.publicKey, 'hex')})`)
  } else {
    console.log('hypertele:', keyPair.publicKey.toString('hex'))
  }
})

if (debug) {
  setInterval(() => {
    console.log('connection stats', stats)
  }, 5000)
}

goodbye(async () => {
  await dht.destroy()
})
