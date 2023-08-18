import { createEnglishWeatherDataExtractorSubsystem } from "../create-english-weather-data-extractor-subsystem";
import { connectionProvider } from "../../../set-up";
import fs  from 'fs/promises';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join("~", "projects", "do-i-need-wellies-3", "server", ".env") });

const englishWeatherDataExtractor = createEnglishWeatherDataExtractorSubsystem(connectionProvider);

async function pullData() {
    let completed = false;
    let iterator = 0;
    while (!completed) {
        try {
            writeToLogFile("starting data sync\n");
            await englishWeatherDataExtractor.pull();
            writeToLogFile("data sync complete\n");
            completed = true;
        } catch(error) {
            iterator += 1;
            if (iterator > 30) {
                throw(error);
            }
        }
    }
}

function writeToLogFile(message: string) {
    const filePath = './daily-call.log';
    fs.appendFile(filePath, message)
}

const today = new Date().toDateString();

pullData().then(() => {
    writeToLogFile(today + ": Success\n");
    console.log(today + ": successfully synced data\n");
}).catch((error) => {
    writeToLogFile(today + ": Failure\n");
    console.log(today + ": unsuccessfully synced data\n");
    console.error("ERROR on day: " + today);
    console.error(error);
});
