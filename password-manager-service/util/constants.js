// noinspection JSUnresolvedFunction

const config = require('config')
const mongoConfig = config.get('mongodb')

const MONGODB_URI = `mongodb://${mongoConfig.host}:${mongoConfig.port}/`
// const MONGODB_URI = `mongodb://${mongoConfig.user}:${mongoConfig.password}@${mongoConfig.host}:${mongoConfig.port}/`

module.exports = {
  MONGODB_URI
}
