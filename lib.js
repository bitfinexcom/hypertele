const path = require('path')
const fs = require('fs')

function findBuf (arr, buf) {
  return arr.findIndex(k => k.equals(buf)) >= 0
}

function resolveToKey(name) {
  let found = null

  ['./', '~/', '/etc'].forEach(d => {
    const path = path.join(d, '.hyper-hosts')

    if (!fs.existsSync(path)) {
      return
    }

    let data = fs.readFileSync(path)

    found = data.split("\n")
  })

  return data.filter(l => {
    return l.startsWith(name)
  })[0]
}

module.exports = {
  findBuf: findBuf
}
