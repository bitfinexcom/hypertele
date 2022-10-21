const sodium = require('sodium-universal')

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

function randomBytes (n) {
  const b = Buffer.alloc(n)
  sodium.randombytes_buf(b)
  return b
}

function findBuf (arr, buf) {
  return arr.findIndex(k => k.equals(buf)) >= 0
}

module.exports = {
  randomBytes: randomBytes,
  findBuf: findBuf,
  parseKeyPair: parseKeyPair,
  storeKeyPair: storeKeyPair,
  connHandler: (connection, _dst, opts = {}, stats = {}) => {
    const loc = _dst()
    if (loc === null) {
      connection.destroy() // don't return rejection error

      if (!stats.rejectCnt) {
        stats.rejectCnt = 0
      }

      stats.rejectCnt++

      return
    }

    if (!stats.locCnt) {
      stats.locCnt = 0
    }

    if (!stats.remCnt) {
      stats.remCnt = 0
    }

    stats.locCnt++
    stats.remCnt++

    let destroyed = false

    loc.pipe(connection).pipe(loc)

    loc.on('error', destroy)
    loc.on('close', destroy)

    connection.on('error', destroy)
    connection.on('close', destroy)

    loc.on('connect', err => {
      if (opts.debug) {
        console.log('connected')
      }
    }).on('error', err => {
      if (opts.debug) {
        console.error(err)
      }
    }).on('close', () => {
      stats.locCnt--
    })

    connection.on('error', err => {
      if (opts.debug) {
        console.error(err)
      }
    }).on('close', () => {
      stats.remCnt--
    })

    function destroy (err) {
      if (destroyed) return
      destroyed = true
      loc.destroy(err)
      connection.destroy(err)
    }
  }
}
