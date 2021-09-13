// noinspection UnnecessaryLocalVariableJS,JSUnresolvedFunction

const { MongoClient } = require('mongodb')
const config = require('config')
const db = config.get('mongodb').db
const constants = require('./constants')

const connection = async () => {
  try {
    const _connection = await MongoClient.connect(constants.MONGODB_URI)
    const _db = await _connection.db(db)
    return _db
  } catch (error) {
    throw new Error()
  }
}

module.exports = {
  connection
}


