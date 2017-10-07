require('babel-register')
require('babel-polyfill')
process.env.NODE_ENV = 'production';


module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    }
  }
};
