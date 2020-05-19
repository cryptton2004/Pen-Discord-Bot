<div align="center">
  <br />
  <p>
    <a href="https://github.com/cryptton2004/Pen-Discord-Bot/blob/master/LICENSE"><img src="https://img.shields.io/packagist/l/doctrine/orm.svg" alt="MIT Liscense" /></a>
  </p>
</div>

# PEN-DISCORD-BOT
A Pen & Paper helper bot for Discord using node.js with the [discord.js](https://github.com/discordjs) framework.
This is a hobby project, so don't expect much as there isn't a defined direction yet.

Anybody who is willing to join in on this project is welcome to do so!


# Setup
Create a .env file in the project root directory with these env variables: (Without < >)
```
TOKEN=<Bot login token>
MONGO_DATABASE=discordBot
MONGODB_SERVER=127.0.0.1:27017
```

# Requirements
```
nodejs
mongodb
```

# COMMANDS

| Command  | Description |
| ------------- | ------------- |
| !inv  | Displays player inventory  |
| !inventory  | Displays player inventory |
| !itemAdd  Username;itemCategory;itemName;itemDescription;quantity| Quantity field is optional. Adds an item to the username; Supported category: gear,weapon,buff |
| !addItem  | Same as above  |

# COMMANDS TO DO

| Command  | Description |
| ------------- | ------------- |
| !register player_nickname (session)| Links pen & paper nickname to discord username so that you don't have to type your name every time. Maybe also link it with a session so that you could have multiple sessions.  |
| !profile  | Displays player info (name, race, level, type, initial A roll, initial w roll, reziliance, attack power, attack rating)|
| !stats  | Displays player stats: (str, con, agi, dex, int, spi, inf, per, power tolerance, will) + player traits (light, earth, nature, air, water, blood magic, shadow, arcane, primal, fire). Actions: melee attacks, ranged attacks, attack rating, attack power (base or buffed)|
| !spellbook  | Displays known spell recipes)|
| !activeSpells  | Displays active spells|
| !addSpell player_nickname;spellName;spellDescription;quantity | Adds a spell to spellbook|
| !removeSpell player_nickname;spellName;quantity | Removes x spell to spellbook|
| !addStats  Username;statsName;quantity| Will add stats with quantity to existing stats (or create new).Ex. Joker|str|10  will add 10 points to str stat|
| !removeStats  Username;statsName;quantity| Ex. Joker|str|10 - removes 10 points from str|
| !gameTime  | Displays current game time |
| !addGameTime time | Passes x time. Ex.  **!addGameTime 1d**  will skip a day|
| !setGameTime time | Sets the ingame current time. **!setGameTime 0** sets the time to day 0 aka start of game. Usefull if just starting new session |


# Installation
```
npm install
node .
```
