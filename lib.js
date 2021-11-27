module.exports = {
  connHandler: (connection, _dst) => {
    const loc = _dst() 

    loc.pipe(connection).pipe(loc)

    loc.on('error', unpipe).on('close', unpipe)
    connection.on('error', unpipe).on('close', unpipe)

    function unpipe () {
      connection.destroy()
      loc.destroy()
    }
  }
}
