import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info', // Set the logging level
  format: format.combine(
    format.timestamp(), // Add timestamp to logs
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message} \n\n`;
    })
  ),
  transports: [
    new transports.Console(), // Log to console
    new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log errors to file
    new transports.File({ filename: 'logs/combined.log' }) // Log all to combined file
  ]
});

export default logger;
