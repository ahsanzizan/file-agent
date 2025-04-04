import * as fs from "fs";
import * as path from "path";

class Logger {
  private logFilePath: string;

  constructor(logFileName: string = "app.log") {
    this.logFilePath = path.join(__dirname, logFileName);
  }

  private formatLog(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  private writeToFile(logMessage: string): void {
    fs.appendFile(this.logFilePath, logMessage + "\n", (err) => {
      if (err) console.error("Error writing to log file:", err);
    });
  }

  logInfo(message: string): void {
    const logMessage = this.formatLog("info", message);
    console.log(logMessage);
    this.writeToFile(logMessage);
  }

  logWarning(message: string): void {
    const logMessage = this.formatLog("warning", message);
    console.warn(logMessage);
    this.writeToFile(logMessage);
  }

  logError(message: string, error?: Error): void {
    const logMessage = this.formatLog("error", message);
    console.error(logMessage);
    if (error) console.error(error);
    this.writeToFile(logMessage + (error ? `\n${error.stack}` : ""));
  }
}

// Export a singleton instance
export const logger = new Logger();
