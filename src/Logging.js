
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path =require('path')
const logDir = 'log';


  const path= path.resolve(__dirname,'../logdir') //Path to logDir where all logs will be saved
  
  const dailyRotateFileTransport = new transports.DailyRotateFile({ //Makes a new log document every day
    filename: path+`/%DATE%-log.json`,

    datePattern: 'YYYY-MM-DD'
    
  });

const logger = createLogger({
  level: 'info',  //Level is set to info, can change levels if you want to use it to something different feks debug
  format: format.combine(
      format.colorize(),
      format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss' //Date and time
      }),
      format.json()
  ),
  
  
  transports: [ new transports.Console({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.printf(
        info => `${info.timestamp} : ${info.message}`//How it should look in the log document
      )
    )
  }),dailyRotateFileTransport] //Transport command to send it tot the chosen log fil 
});

logger.info('Hello world'); //Information wich will be added
