module.exports = {
  connHandler: (connection, _dst, opts = {}, stats = {}) => {
    const loc = _dst()

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

    const unpipe = () => {
      setTimeout(() => {
        loc.destroy()
        connection.destroy()
      }, 100)
      loc.end()
      connection.end()
//      stats.locCntPiped--
//      stats.remCntPiped--
    }

    loc.on('connect', err => {
      if (opts.debug) {
        console.log('connected')
      }
    }).on('error', err => {
      if (opts.debug) {
        console.error(err)
      }
      unpipe()
    }).on('data', d => {
      connection.write(d)
    }).on('end', unpipe).on('close', () => {
      stats.locCnt--
      unpipe()
    })

    connection.on('error', err => {
      if (opts.debug) {
        console.error(err)
      }
      unpipe()
    }).on('data', d => {
      loc.write(d)
    }).on('end', unpipe).on('close', () => {
      stats.remCnt--
      unpipe()
    })

  }
}
