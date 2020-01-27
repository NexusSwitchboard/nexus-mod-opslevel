import createDebug from "debug";

import {Router} from "express";
import {ConfluenceConnection} from "@nexus-switchboard/nexus-conn-confluence";
import {OpsLevelConnection} from "@nexus-switchboard/nexus-conn-opslevel";

import {
    ConnectionRequestDefinition,
    IRouteDefinition,
    Job,
    NexusJobDefinition,
    NexusModule,
    NexusModuleConfig
} from "@nexus-switchboard/nexus-extend";
import {ServiceDocumentationJob} from "./jobs/serviceDocumentationJob";

import {routes} from "./routes";

export const logger = createDebug("nexus:module:opslevel");

class OpslevelModule extends NexusModule {

    public name = "opslevel";

    public loadConfig(overrides?: NexusModuleConfig): NexusModuleConfig {
        const defaults = {
            CONFLUENCE_HOST: "__env__",
            CONFLUENCE_USERNAME: "__env__",
            CONFLUENCE_API_KEY: "__env__",
            OPSLEVEL_TOKEN: "__env__",
            OPSLEVEL_GQL_ENDPOINT: "__env__",
            SENDGRID_API_KEY: "__env__"
        };

        return overrides ? Object.assign({}, defaults, overrides) : {...defaults};
    }

    public loadRoutes(_config: NexusModuleConfig): IRouteDefinition[] {
        return routes;
    }

    // the user will define job instance in the .nexus file.  Nexus will pass that configuration into
    //  this loader.  Use the type to identify the right job class and instantiate it with the configuration
    //  object given.  Return instances to the nexus core which will manage them from there.
    public loadJobs(jobsDefinition: NexusJobDefinition[]): Job[] {
        try {

            return jobsDefinition.map((c) => {
                if (c.type === "service_documentation") {
                    return new ServiceDocumentationJob(c);
                } else {
                    return undefined;
                }
            }).filter((o) => o !== undefined);

        } catch (e) {
            logger("There was a problem creating jobs for this service: " + e.toString());
        }
        return [];
    }

    // most modules will use at least one connection.  This will allow the user to instantiate the connections
    //  and configure them using configuration that is specific to this module.
    public loadConnections(config: NexusModuleConfig, _router: Router): ConnectionRequestDefinition[] {
        return [
            {
                name: "@nexus-switchboard/nexus-conn-opslevel",
                config: {
                    apiToken: config.OPSLEVEL_TOKEN,
                    graphQlEndpoint: config.OPSLEVEL_GQL_ENDPOINT
                }
            },
            {
                name: "@nexus-switchboard/nexus-conn-confluence",
                config: {
                    host: config.CONFLUENCE_HOST,
                    username: config.CONFLUENCE_USERNAME,
                    apiToken: config.CONFLUENCE_API_KEY
                }
            }
        ];
    }

    public getConfluence(): ConfluenceConnection {
        return this.getActiveConnection("@nexus-switchboard/nexus-conn-confluence") as ConfluenceConnection;
    }

    public getOpslevel(): OpsLevelConnection {
        return this.getActiveConnection("@nexus-switchboard/nexus-conn-opslevel") as OpsLevelConnection;
    }
}

export default new OpslevelModule();
