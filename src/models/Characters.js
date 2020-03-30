let mongoose = require('mongoose')
let validator = require('validator')

let characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false
  },
  category: {
    type: String,
    required: true,
    unique: false
  },
  itemName: {
    type: String,
    required: true,
    unique: false
  },
  itemDescription: {
    type: String,
    required: true,
    unique: false
  },
  quantity: {
    type: Number,
    required: false,
    unique: false
  },
  email: {
    type: String,
    required: false,
    unique: false,
    lowercase: false,
    validate: (value) => {
      return validator.isEmail(value)
    }
  }
})

var itemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: false
  },
  itemName: {
    type: String,
    required: true,
    unique: false
  },
  itemDescription: {
    type: String,
    required: true,
    unique: false
  },
  quantity: {
    type: Number,
    required: false,
    unique: false
  }
},
{ collection: 'Characters'})

let groupedCharacterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: false
  },
  category: {
    type: String,
    required: true,
    unique: false
  },
  itemName: {
    type: String,
    required: true,
    unique: false
  },
  itemDescription: {
    type: String,
    required: true,
    unique: false
  },
  quantity: {
    type: Number,
    required: false,
    unique: false
  }
},
{ collection: 'characters'})

let timestampPlugin = require('./plugins/timestamp')

characterSchema.plugin(timestampPlugin)
groupedCharacterSchema.plugin(timestampPlugin)

mongoose.model('Characters', characterSchema)
var CharacterModel = mongoose.model('Characters');
module.exports = CharacterModel;

mongoose.model('GroupedCharacters', groupedCharacterSchema)
var GroupedCharacters = mongoose.model('GroupedCharacters');
module.exports = GroupedCharacters;