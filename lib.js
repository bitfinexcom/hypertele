module.exports = {
  connHandler: (connection, _dst) => {
    let locConnected = false
    let remConnected = true

    const loc = _dst() 

    loc.on('connect', err => {
      locConnected = true
    })

    loc.on('error', err => {
      console.error(err)
    })

    loc.on('data', d => {
      if (!remConnected) {
        return
      }

      connection.write(d)
    })

    connection.on('close', x => {
      if (locConnected) {
        loc.end()
        locConnected = false
      } 
    })

    loc.on('close', x => {
      locConnected = false

      if (remConnected) {
        connection.end()
        remConnected = false
      }
    })

    connection.on('data', d => {
      if (!locConnected) {
        return
      }

      loc.write(d)
    })
  }
}
