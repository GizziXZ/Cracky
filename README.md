# Openpgp Discord bot
(you can save multiple keypairs)

![image](https://github.com/user-attachments/assets/f498e31b-055e-4ed6-8ce4-cc46f9cf2655)
![image](https://github.com/user-attachments/assets/bb60333b-c242-4931-a561-529bd80640f4)

Discord bot for quick openpgp access and utility.

If you are serious about opsec, highly do not recommend using this bot and just stick to using openpgp on your device instead, as you are giving your private key to discord, so it becomes compromised.

## Features

* Encrypt and decrypt messages
* Sign and verify messages
* Generate keypairs

## How to use
inside the openpgp-discord folder run the following command
```
npm i
```
create a `config.json` file and use this template
```json
{
    "TOKEN":"Discord bot token here"
}
```
and then finally to run the bot
```
node index.js
```
