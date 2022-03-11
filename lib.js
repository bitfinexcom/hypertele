const pump = require('pump')

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

    pump(loc, connection, loc)

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
  }
}
