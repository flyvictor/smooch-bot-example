'use strict';

const Script = require('smooch-bot').Script;
const _ = require('lodash');

const api = require('./console/dummy-api.js');
const airportScriptFactory = require('./console/airport-script-factory');
const datetimeScriptFactory = require('./console/datetime-script-factory');

var scriptObj = {
  start: {
    receive: (bot, message) => {
      return bot.say('Hi 👋!\nI\'m VicBot, your personal, robotic travel advisor,' +
        'I have limited skills right now so please be gentle 🙄 !')
        .then(() => 'intro');
    }
  },
  intro: {
    prompt: (bot) => {
      return bot.say('If you\'d like more info about Victor, please say "Victor Info". ' +
        'If you\'d rather just get on with booking a charter say "charter"')
    },
    receive: (bot, message) => {
      const choice = message.text.trim();

      if (choice.match(/.*victor.*/i)) {
        return bot.say('Victor info it is!')
          .then(() => 'victorInfo');
      } else if (choice.match(/.*charter.*/i)) {
        return bot.say('Excellent, on we go')
          .then(() => 'getDeptAirport');
      }

    }
  },
  victorInfo: {
    prompt: (bot) => {
      return bot.say('Here at Victor we believe in transparency and trust.' +
        'That\'s why unlike all the brokers, we guarantee a fixed 10%' +
        ' margin on all the quotes you receive from us. Heard enough?')
    },
    receive: (bot, message) => {
      return bot.say('Cool, let\'s book you a flight')
        .then(() => 'getDeptAirport');
    }
  },
  finish: {
    prompt: (bot) => bot.say('TODO - Add Passengers & confirmation'),
    receive: (bot, message) => {
      return bot.getProp('name')
        .then((name) => bot.say(`Sorry ${name}, my creator didn't ` +
          'teach me how to do anything else!'))
        .then(() => 'start');
    }
  }
};

scriptObj = _.extend(scriptObj,
  airportScriptFactory("deptAirport", "getArrAirport"),
  airportScriptFactory("arrAirport", "getDepatureDate"),
  datetimeScriptFactory("finish")
);

module.exports = new Script(scriptObj);
