import { App } from "./express-server/app";
import { localExpert } from "./set-up";


const app = new App(localExpert);

app.listen();


