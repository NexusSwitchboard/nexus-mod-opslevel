# Infra
The Infra module provides functionality that provides ways of interacting with the infra team through existing tools, maintaining documentation that infrastructure is respoonsible among other things.

# Add "Submit Infra Request" to Message Actions**

A new action will appear in the actions menu named Submit Infra Request.

When clicked, a modal appears allowing the user to enter request details.

When the modal is submitted, a Jira Ticket is created and associated with the channel in which the message first appeared.  It will also post a reply in the thread with information about the ticket submitted and action buttons that allow folks to cancel, claim and complete the ticket directly from Slack.

## Implementation
The ServiceRequest class is where the bulk of the functionality lives. The `interactions.ts` file is where the interactions are received.  

### Associating Slack with Jira and vice versa
The most important thing to remember is that we use the channel and timestamp of the thread to associate slack actions with the created ticket.  To do that, we submit the channel/ts combo as a label in Jira and use that to reference back to the original slack message and action areas.

### Associating Slack Users with Jira Users
In order for the create, claim, cancel and complete actions to set the reporter and assignee properly based on the slack user who is performing the action, we assume that the email associated with the slack user is the same as the email associated with the jira user.  *If that is not the case, then user operations will not work.*

## Slack App Configuration
You will need the following configuration options set in the Slack App you create and point to your instance of the module:

1. Intractive Components
   1. Enable
   2. Add Action: Callback ID is submit_infra_request
   3. Action Name: Whatever you want
   4. Request URL: https://<your_dmoain>/m/infra/slack/interactions
2. OAuth & Permissions
   1. Scopes - See below for the scopes that you will need to add and request permission from users to apply
   2. Bot User - Add a bot and name it whatever you want
   3. Always Show My Bot Online - Set to "On" (but not required)

## Slack App Permissions
The Slack App requires the following OAuth roles to function properly:

* bot - Required for having a bot presence that can behave as a user and be mentioned and DM'd
* channels:history - Required to pull message information from a channel
* groups:history - Required to pull message information from a user's private chanel
* im:history - Required to pull message information from the user's DMs
* mpim:history - Required to pull message information from the users' multi-person DMs
* users:read - Required to pull profile information needed to connect Jira with Slack
* users:read.email - Required to pull user's email needed to connect Jira with Slack

## Module Configuration
    # This is the project that new requests will be added to
    REQUEST_JIRA_PROJECT: "<JIRA_KEY>",   

    # This is the issue type for the tickets created
    REQUEST_JIRA_ISSUE_TYPE_ID: "<JIRA_ISSUE_TYPE_ID>",

    # This is the epic under which the ticket will be created
    REQUEST_JIRA_EPIC: "<JIRA_EPIC_PARENT_KEY>",

    # This is the transition to use to set the status to some form of _In Progress_
    REQUEST_JIRA_START_TRANSITION_ID: 21,

    # This is the transition  to use to set the status to some form of _Done_ (note that cancel and complete use the same transition but the resolution is set to "Done" for complete and "Won't Do" for cancelled)
    REQUEST_JIRA_COMPLETE_TRANSITION_ID: 31,

    # Mapping priorities to Jira Priority IDs.  You can probably leave
    #   these as is.
    PRIORITIES: {
        emergency: "5",
        immediate: "5",
        high: "4",
        medium: "2",
        low: "3"
    }

The following are connection-specific configuration options:

* *INFRA*_SLACK_APP_ID: [`string`]
* *INFRA*_SLACK_CLIENT_ID: [`string`]
* *INFRA*_SLACK_CLIENT_SECRET: [`string`]
* *INFRA*_SLACK_SIGNING_SECRET: [`string`]
* *INFRA*_SLACK_CLIENT_OAUTH_TOKEN: xoxp-[`string`]
* *INFRA*_SLACK_USER_OAUTH_TOKEN: xoxb-[`string`]*
* *INFRA*_JIRA_HOST: [`subdomain`].atlassian.net
* *INFRA*_JIRA_USERNAME: [`email`]
* *INFRA*_JIRA_API_KEY: [`user_api_key`]

Note that the INFRA_ prefix is only necessary when stored as environment variables.  See documentation on cnofiguration secrets in the main `README.md`

# Sync OpsLevel Service Info with Confluence Page
This module creates a job that will periodically run and pull the data from an OpsLevel account and generate a Confluence page that lists all the services (and some basic information about it) in table form.

## Module Configuration

* CONF_SERVICE_LIST_PAGE_ID: "<`confluence_page_id`>" - This is the confluence page that will be updated.
* CONF_SERVICE_UPDATE_FREQ: "<`cron_schedule_string`>" - This is the cron configuration string used to schedule the job.

These are connection-specific configuration options:

* *INFRA*_OPSLEVEL_TOKEN=[`string`]
* *INFRA*_OPSLEVEL_GQL_ENDPOINT=[`url`]
* *INFRA*_CONFLUENCE_HOST=https://[`subdomain`].atlassian.net/wiki
* *INFRA*_CONFLUENCE_USERNAME=[`email`]
* *INFRA*_CONFLUENCE_API_KEY=[`api_key`]
* *INFRA*_SENDGRID_API_KEY=[`string`]

Note that the INFRA_ prefix is only necessary when stored as environment variables.  See documentation on cnofiguration secrets in the main `README.md`
