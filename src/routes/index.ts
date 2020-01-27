import {Request, Response} from "express";
import {IRouteDefinition} from "@nexus-switchboard/nexus-extend";
import moduleInstance from "..";

export const routes: IRouteDefinition[] = [{
    method: "get",
    path: "/opslevel/services",
    handler: async (_req: Request, res: Response) => {

        const ops = moduleInstance.getOpslevel();
        const services = await ops.getServices();

        if (services) {
            return res.json(services).status(200);
        } else {
            return res.json({message: "Unable to get the list of services from OpsLevel"}).status(500);
        }

    },
    protected: false
}];
