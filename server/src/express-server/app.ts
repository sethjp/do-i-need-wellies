import express from 'express';
import path from 'path';
import { Location } from '../util/location';
import { LocalExpert } from '../local-expert';


export class App {
    public app: express.Application;
    
    constructor(private localExpert: LocalExpert) {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(express.static(path.join(__dirname, "..", "..", "client", "build")));
        this.app.use("/", this.localInformationRouter());

    }
    
    private localInformationRouter() {
        const localInformationRouter = express.Router();
        localInformationRouter.post("/data", async  (req, res) => {
            const {latitude, longitude} = req.body;
        
            const location = new Location(latitude, longitude);
        
            const localReport = await this.localExpert.localInformationFor(location);

            
            const wellyNecessityRating = localReport.wellyNecessityRating;
            
            const rainfall = (localReport.rainfall).map((rainfall) => {
                return {
                    rainfall_mm: rainfall.amount.millimetres,
                    fellOn: rainfall.fellOn.toISOString()
                }
            })

            res.json({
                rainfall,
                wellyNecessityRating,
            });
        });

        return localInformationRouter;
    }

    listen() {
        this.app.listen(4000, () => {
        console.log('Listening on port 4000')
        })
    }

} 