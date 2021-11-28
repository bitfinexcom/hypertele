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
    })

    loc.on('error', err => {
      if (opts.debug) {
        console.error(err)
      }
      unpipe()
    })

    loc.on('data', d => {
      connection.write(d)
    })

    loc.on('close', unpipe)

    connection.on('error', err => {
      if (opts.debug) {
        console.error(err)
      }
      unpipe()
    })

    connection.on('data', d => {
      loc.write(d)
    })

    connection.on('close', unpipe)
  }
}
