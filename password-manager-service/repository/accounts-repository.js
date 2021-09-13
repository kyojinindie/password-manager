// noinspection JSUnresolvedFunction

const db = require('../util/mongodb-connection')
const config = require('config')
const collection = config.get('mongodb').collection

const getAccounts = async () => {
  try {
    const _db = await db.connection()
    const _collection = await _db.collection(collection)
    return _collection.find().toArray()
  } catch (error) {
    throw new Error()
  }
}

module.exports = {
  getAccounts
}
