'use strict';

const smoochBot = require('smooch-bot');
const MemoryStore = smoochBot.MemoryStore;
const MemoryLock = smoochBot.MemoryLock;
const Bot = smoochBot.Bot;
const Script = smoochBot.Script;
const StateMachine = smoochBot.StateMachine;
const api = require( './dummy-api.js' );
const _ = require( 'lodash' );
const airportScriptFactory = require( './airport-script-factory' );

class ConsoleBot extends Bot {
  constructor(options) {
    super(options);
  }

  say(text) {
    return new Promise((resolve) => {
      console.log(text);
      resolve();
    });
  }
}

var scriptObj = {
  start: {
    receive: (bot, message) => {
      return bot.say( 'Hi 👋!\nI\'m VicBot, your personal, robotic travel advisor,' +
          'I have limited skills right now so please be gentle 🙄 !' )
        .then(() => 'intro');
    }
  },
  intro: {
    prompt: (bot) => {
      return bot.say( 'If you\'d like more info about Victor, please say "Victor Info". ' +
          'If you\'d rather just get on with booking a charter say "charter"' )
    },
    receive: (bot, message) => {
      const choice = message.text.trim();

      if( choice.match( /.*victor.*/i ) ) {
        return bot.say( 'Victor info it is!' )
          .then(() => 'victorInfo');
      }
      else if( choice.match( /.*charter.*/i ) ) {
        return bot.say( 'Excellent, on we go' )
          .then(() => 'getDeptAirport');
      }

    }
  },
  victorInfo: {
    prompt: (bot) => {
      return bot.say( 'Here at Victor we believe in transparency and trust.' +
          'That\'s why unlike all the brokers, we guarantee a fixed 10%' +
          ' margin on all the quotes you receive from us. Heard enough?' )
    },
    receive: (bot,message) => {
      return bot.say( 'Cool, let\'s book you a flight' )
          .then(() => 'getDeptAirport');
    }
  },
  finish: {
    receive: (bot, message) => {
      return bot.getProp('name')
        .then((name) => bot.say(`Sorry ${name}, my creator didn't ` +
            'teach me how to do anything else!'))
        .then(() => 'finish');
      }
  }
};

scriptObj = _.extend( scriptObj,
  airportScriptFactory( "deptAirport", "getArrAirport" ),
  airportScriptFactory( "arrAirport", "finish"  )
);

const script = new Script( scriptObj );


const userId = 'testUserId';
const store = new MemoryStore();
const lock = new MemoryLock();
const bot = new ConsoleBot({
    store,
    lock,
    userId
});

const stateMachine = new StateMachine({
    script,
    bot,
    userId
});

process.stdin.on('data', function(data) {
    stateMachine.receiveMessage({
        text: data.toString().trim()
    })
    .catch((err) => {
        console.error(err);
        console.error(err.stack);
    });
});

function repeat( bot ){
  return bot.getState(( state ) => {
    return bot.say( 'Sorry, I didn\'t quite catch that, please try again' )
      .then( ()=> state );
  });
}

function airportLookup( query ){
  return api.searchAirports( query )
}


function parseService( serviceReq ){
  return {
    id: "charter",
    name: "request a charter"
  };
}
