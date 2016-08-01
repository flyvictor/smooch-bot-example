var chrono = require('chrono-node');
const moment = require('moment');

/**
 * TODO - May need refactoring to be inline with airport-script-factory
 * Returns states for datetime
 * @param  {String} nextState state to transition to after datetime is complete
 * @return {Object}
 */
module.exports = nextState => {

  return {
    getDepatureDate: {
      prompt: (bot) => bot.say('When would you like to depart?'),
      receive: (bot, message) => {

        const date = chrono.parseDate(message.text);
        const hasTime = moment(date).format("H:mm") !== "12:00"

        const formattedDate = moment(date).format("dddd, Do MMMM");

        const isIntoTheFuture = moment(date).isAfter(moment().add(2, 'days'));
        const isInThePast = moment(date).isBefore(moment().hour(11));

        /**
         * If date can not be read
         */
        if (date === null) {
          return bot
            .say(`Sorry! that's an invalid date. example answers:
          - Next Friday 11am
          - August 14th
          - Tomorrow
        `)
            .then(() => 'getDepatureDate');
        }

        /**
         * If date is not in the past and not 48 hours into the future
         */
        if (isInThePast || !isIntoTheFuture) {
          return bot
            .say(`Sorry! I can only look for flights after the ${moment().add(2, 'days').format("Do MMMM")}`)
            .then(() => 'getDepatureDate');
        }

        return bot
          .setProp('date', date)
          .then(() => {
            return bot
              .say(`Great! your looking to fly on the ${formattedDate}.`)
              .then(() => 'confirmDepatureDate')
          });

      }

    },

    confirmDepatureDate: {
      prompt: (bot) => bot.say('Is that correct?'),      
      receive: (bot, message) => {

        var isYes = /y(?:es)?|1/i.test(message.text)
        var isNo = /n(?:o)?|0/i.test(message.text)

        if (!isYes && !isNo) {
          return bot
            .say(`Sorry Thats not a valid answer`)
            .then(() => 'confirmDepatureDate');
        }

        if (isNo) {
          return bot
            .say(`No problem! lets try again`)
            .then(() => 'getDepatureDate');
        }

        if (isYes) {
          return bot
          	.say(`Great! lets continue`)
            .then(() => nextState);
        }
      }
    }
  }
}
