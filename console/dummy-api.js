const rp = require('request-promise');
require( 'dotenv' ).config();

exports.searchAirports = function( query ){
  var opts = {
    oauth: {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
    },
    uri: process.env.BASE_URI + '/airports/find',
    qs: {
      searchText: query,
    },
    headers: {
      'User-Agent': 'Request-Promise',
    },
    json: true
  };

  return rp( opts ).then( function( data ){
    return data.destinations;
  }).catch( function( err ){
    console.err( "Problem retrieving airports" );
    return [];
  });
}
