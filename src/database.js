let mongoose = require('mongoose');
require('dotenv').config({ path: 'src/.env' })

const server = process.env.MONGODB_SERVER; // REPLACE WITH YOUR DB SERVER
const database = process.env.MONGO_DATABASE;      // REPLACE WITH YOUR DB NAME

class Database {
  constructor() {
    this._connect()
  }
  
_connect() {
     mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}
module.exports = new Database()
module.exports.Characters = require('./models/Characters');
module.exports.mongoose = mongoose;