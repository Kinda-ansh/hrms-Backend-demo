const { createLogger, format, transports } = require('winston');
const Transport = require('winston-transport');
const moment = require('moment-timezone');
const Log = require('../model/Logs');

class MongoDBTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    
    const logEntry = new Log({
      level: info.level,
      message: info.message,
      meta: info.meta,
      timestamp: info.timestamp,
    });

    logEntry.save(callback);
  }
}

const logs = createLogger({
  format: format.combine(
    format((info) => {
      info.timestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'); // Format timestamp as string
      return info;
    })(),
    format.json()
  ),
  transports: [
    new MongoDBTransport(),
    new transports.Console(),
  ],
});

module.exports = logs;
