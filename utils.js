#!/usr/bin/env node
const HyperDHT = require('@hyperswarm/dht')
const fs = require('fs')
const argv = require('minimist')(process.argv.slice(2))
const lib = require('./lib.js')

const helpMsg = 'Usage:\nhypertele-utils --gen_seed | --gen_keypair filename.json'

if (argv.gen_seed) {
  console.log('Init Seed:', lib.randomBytes(32).toString('hex'))
  process.exit(-1)
}

if (argv.gen_keypair) {
  const kp = HyperDHT.keyPair()
  const file = argv.gen_keypair

  if (typeof file !== 'string' || file.length < 2) {
    console.error('Please provide a valid filename')
    console.log(helpMsg)
    process.exit(-1)
  }

  fs.writeFileSync(file, lib.storeKeyPair(kp))
  console.log('Public Key:', kp.publicKey.toString('hex'))
  process.exit(-1)
}

if (argv.help) {
  console.log(helpMsg)
  process.exit(-1)
}
