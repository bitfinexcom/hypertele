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
      try {
        loc.end()
      } catch (e) {
        console.error(e)
      }
    })

    loc.on('data', d => {
      try {
        connection.write(d)
      } catch (e) {
        console.error(e)
      }
    })

    loc.on('close', x => {
      locConnected = false

      if (remConnected) {
        try {
          connection.end()
        } catch (e) {
          console.error(e)
        }
        remConnected = false
      }
    })

    connection.on('error', err => {
      try {
        connection.end()
      } catch (e) {
        console.error(e)
      }
    })

    connection.on('data', d => {
      if (!locConnected) {
        return
      }

      try {
        loc.write(d)
      } catch (e) {
        console.error(e)
      }
    })

    connection.on('close', x => {
      if (locConnected) {
        try {
          loc.end()
        } catch (e) {
          console.error(e)
        }
        locConnected = false
      } 
    })
  }
}
