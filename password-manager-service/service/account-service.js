const accountRepository = require('../repository/accounts-repository')

const getAccounts = () => {
  try {
    return accountRepository.getAccounts()
  } catch (error) {
    throw new Error()
  }
}

module.exports = {
  getAccounts
}
