const fs = require('fs');
const data = JSON.parse(fs.readFileSync('w-daily-clean.json', 'utf8'));

// Delete read-only properties for PUT
delete data.id;
delete data.createdAt;
delete data.updatedAt;
delete data.activeVersion;
delete data.activeVersionId;
delete data.versionId;
delete data.versionCounter;
delete data.triggerCount;

data.nodes.forEach(node => {
  if (node.name === "Discord Webhook (HTTP)") {
    node.parameters.specifyBody = "keypair";
    node.parameters.bodyParameters = {
      parameters: [
        {
          name: "content",
          value: "={{ $json.text }}"
        }
      ]
    };
    delete node.parameters.jsonBody;
  }
});

fs.writeFileSync('w-daily-clean2.json', JSON.stringify(data, null, 2));
