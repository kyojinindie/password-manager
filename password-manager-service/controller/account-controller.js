const accountService = require('../service/account-service')

const getAccounts = async (req, res) => {
  try {
    const result = await accountService.getAccounts()
    res.json(result)
  } catch (error) {
    throw new Error()
  }
}

module.exports = {
  getAccounts
}
