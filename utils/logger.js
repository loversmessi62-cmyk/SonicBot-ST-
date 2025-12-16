import fs from "fs";

const logFile = "./logs.txt";

export const logCommand = ({ time, command, sender, group }) => {
    const line = `[${time}] CMD ${command} | ${sender} | ${group}\n`;
    fs.appendFileSync(logFile, line);
};

export const logError = ({ time, error, plugin }) => {
    const line = `[${time}] ERROR ${plugin} | ${error}\n`;
    fs.appendFileSync(logFile, line);
};
