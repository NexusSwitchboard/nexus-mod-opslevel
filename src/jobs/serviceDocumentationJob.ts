import {Job, loadTemplate} from "@nexus-switchboard/nexus-extend";
import path from "path";
import {Content, ContentFormat} from "ts-confluence-client/dist/resources/types";
import moduleInstance from "..";

export class ServiceDocumentationJob extends Job {

    public name = "service_documentation";
    protected requiredOptions = ["CONF_SERVICE_LIST_PAGE_ID"];

    protected async _run(): Promise<boolean> {
        await this.updateConfluenceServicePage();
        return true;
    }

    /**
     * This will pull the latest list of services from opslevel and update the given page
     * in confluence with the list as well as relevant information.
     */
    protected async updateConfluenceServicePage(): Promise<Content> {
        const ops = moduleInstance.getOpslevel();
        const conf = moduleInstance.getConfluence();

        const services = await ops.getServices();

        // sort alphabetically
        const orderedServices = services.sort((s1, s2) => {
            return (s1.name > s2.name) ? 1 : (s1.name < s2.name) ? -1 : 0;
        });

        const templateFile = path.join(__dirname, "../views/conf_services.hb");
        const html = loadTemplate(templateFile, {services: orderedServices});
        const pageId = this.definition.options.CONF_SERVICE_LIST_PAGE_ID;

        return await conf.api.content.updateContent(pageId, {
            body: html,
            format: ContentFormat.storage
        });
    }

}
