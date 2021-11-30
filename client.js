#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const net = require('net')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const connHandler = require('./lib.js').connHandler

const helpMsg = `Usage:\nhyperproxy -p port_listen -c conf.json`

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

if (!conf.peer) {
  console.error('Error: conf.peer invalid')
  process.exit(-1)
}

const debug = argv.debug

const dht = new HyperDHT()

const stats = {}

const proxy = net.createServer(c => {
  return connHandler(c, () => {
    const stream = dht.connect(Buffer.from(conf.peer, 'hex'))

    setImmediate(() => {
     stream.emit('connect')
    })

    return stream
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
