module.exports = {
  connHandler: (connection, _dst, opts = {}) => {
    const loc = _dst() 

    const unpipe = () => {
      setTimeout(() => {
        connection.destroy()
      }, 100)
      loc.destroy()
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
    }).on('end', () => {
      connection.end()
      unpipe()
    }).on('close', unpipe)

    connection.on('error', err => {
      if (opts.debug) {
        console.error(err)
      }
      unpipe()
    }).on('data', d => {
      loc.write(d)
    }).on('end', () => {
      loc.end()
      unpipe()
    }).on('close', unpipe)
  }
}
