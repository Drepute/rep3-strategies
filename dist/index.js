
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./rep3-whitelistor.cjs.production.min.js')
} else {
  module.exports = require('./rep3-whitelistor.cjs.development.js')
}
