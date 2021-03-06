const _ = require( 'lodash' );
const api = require( './dummy-api.js' );

module.exports = function( airportType, nextState ){
  var scriptlet = {};
  var modifier = airportType === "arrAirport" ?
    "to?" :
    ('from?\nYou can say cities ( e.g London ),\n' +
    'Airport Names ( e.g Gatwick ),\n' +
    'Airport Codes ( e.g LGW )\n');

  var firstStepName = _.camelCase( 'get-' + airportType );
  var secondStepName = _.camelCase( 'choose-' + airportType );
  var listName = _.camelCase( airportType + 'List' );
  var keyName = _.camelCase( airportType );

  scriptlet[ firstStepName ] = {
    prompt: (bot) => bot.say('\n\nWhich airport would you like to fly ' + modifier ),
    receive: (bot, message) => {
      const query = message.text.trim();
      if( !query ){
        return repeat( bot );
      }
      return airportLookup( query )
        .then((airportList)=>{
          if( !airportList.length ){
            return bot.say('Sorry, I couldn\'t find anywhere matching your query.')
              .then(() => keyName );
          }
          else{
            var a = bot.setProp( listName, JSON.stringify(airportList) );
            return a.then(function() {
              return bot.getProp(listName).then(function(){
                return bot.say('Thanks!').then(()=> secondStepName);
              });
            })
            .catch(function(e) {
              console.log('PROMISE ERROR:',e);
            })
          }
        })
    }
  }

  scriptlet[ secondStepName ] = {
    prompt: (bot) => {
      var list = bot.getProp(listName);
      return bot.getProp( listName )
        .then(( list ) => {
          var str = 'Please select which airport you mean, by saying a number\n'
          var numberedList = JSON.parse(list).map( ( obj, o ) => {
            return ( o + 1 ).toString() + ". " + obj.displayText;
          });
          str += numberedList.join( '\n' );
          str += '\n\nif your option isn\'t there, say No';
          return bot.say( str );
        })
        .catch(function(e) {
          console.log('Ooops',e)
        });
    },
    receive: (bot, message) => {
      const opt = message.text.trim();
      if( Number.isInteger( opt * 1) ){
        return bot.getProp( listName ).then( list  => {
          var item = JSON.parse(list)[ opt - 1 ];
          return bot.setProp( keyName, JSON.stringify(item) ).then(() =>{
            return bot.say( item.displayText + '\nThankyou!\n' )
              .then(() => nextState )
          });

        });
      }
      else if( opt === "No" ){
        return bot.say( 'Let\'s try again' )
          .then( ()=> firstStepName );
      }
      else
        return repeat( bot );
      }
  };

  return scriptlet;
}
function repeat( bot ){
  return bot.getState(( state ) => {
    return bot.say( 'Sorry, I didn\'t quite catch that, please try again' )
      .then( ()=> state );
  });
}

function airportLookup( query ){
  return api.searchAirports( query )
}

