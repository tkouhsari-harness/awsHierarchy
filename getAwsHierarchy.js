const { OrganizationsClient, ListRootsCommand, ListAccountsForParentCommand, ListOrganizationalUnitsForParentCommand } = require("@aws-sdk/client-organizations");

const organizationClient = new OrganizationsClient();

async function listOrganizationalUnitsForParentCommand(parent) {
    const input = {
        ParentId: parent
    };
    const command = new ListOrganizationalUnitsForParentCommand(input);
    try {
        const response = await organizationClient.send(command);
        return response.OrganizationalUnits.map(a => ({
            "name": a.Name,
            "id": a.Id
        }));;
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function listAccountsForParent(parent) {
    const input = {
        ParentId: parent
    };
    const command = new ListAccountsForParentCommand(input);
    try {
        const response = await organizationClient.send(command);
        return response.Accounts.map(a => ({
            "name": a.Name,
            "id": a.Id
        }));
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function getRoot() {
    const command = new ListRootsCommand({});
    try {
        const response = await organizationClient.send(command);
        return {
            "name": response.Roots[0].Name,
            "id": response.Roots[0].Id
        };
    } catch (e) {
        console.log(e);
        return null;
    }
}

async function getParentDetails(id, name) {
    let ouDetails = {
        name: name,
        childOus: [],
        accounts: []
    }
    let ous = await listOrganizationalUnitsForParentCommand(id);
    for (let ou of ous || []) {
        ouDetails.childOus.push(await getParentDetails(ou.id, ou.name));
    }
    ouDetails.accounts = await listAccountsForParent(id);
    return { [id]: ouDetails };
}

async function main() {
    let root = await getRoot();
    let hierarchy = {};
    hierarchy = await getParentDetails(root.id, root.name);
    console.log(JSON.stringify(hierarchy, null, 4));
}

main();
