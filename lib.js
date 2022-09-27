module.exports = {
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
//      stats.locCntPiped = 0
    }

    if (!stats.remCnt) {
      stats.remCnt = 0
//      stats.remCntPiped = 0
    }

    stats.locCnt++
//    stats.locCntPiped++
    stats.remCnt++
//    stats.remCntPiped++

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
