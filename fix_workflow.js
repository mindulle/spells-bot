const fs = require('fs');

const data = JSON.parse(fs.readFileSync('w-daily.json', 'utf8'));

// Delete unnecessary top-level keys for PUT
delete data.id;
delete data.createdAt;
delete data.updatedAt;
delete data.activeVersion;
delete data.activeVersionId;
delete data.versionId;
delete data.versionCounter;
delete data.triggerCount;

data.nodes.forEach(node => {
  if (node.name === "Notion (Today's Schedule)") {
    // 1. Add returnAll
    node.parameters.returnAll = true;
    // 2. Always output data so workflow doesn't stop if 0 schedules
    node.alwaysOutputData = true;
  }
  
  if (node.name === "Format Briefing (Code)") {
    node.parameters.jsCode = `
const notionItems = $items("Notion (Today's Schedule)");
const paperclipItems = $items("Paperclip (Pending Issues)");

// 빈 데이터({} 등) 필터링
const notionSchedules = notionItems.map(i => i.json).filter(j => Object.keys(j).length > 0);
const paperclipIssues = paperclipItems.map(i => i.json).filter(j => Object.keys(j).length > 0);

let scheduleText = "";
if (notionSchedules.length > 0) {
  notionSchedules.forEach((j, index) => {
    // n8n 버전에 따라 property_이름 혹은 바로 이름으로 들어옴
    const props = j["이름"] || j.property_이름 || j.Name || '제목 없음';
    scheduleText += \`\${index + 1}. 📅 \${props}\\n\`;
  });
} else {
  scheduleText = "오늘 예정된 일정이 없습니다. ☕\\n";
}

let issuesText = "";
if (paperclipIssues.length > 0) {
  const displayIssues = paperclipIssues.slice(0, 5);
  displayIssues.forEach((issue, index) => {
    const issueId = issue.id ? issue.id.substring(0,8) : 'N/A';
    issuesText += \`\${index + 1}. ⏳ [\${issueId}] \${issue.title}\\n\`;
  });
  if (paperclipIssues.length > 5) issuesText += \`...외 \${paperclipIssues.length - 5}건\\n\`;
} else {
  issuesText = "마감일이 임박한 대기 이슈가 없습니다. 🎉\\n";
}

const discordMessage = \`**☀️ 오늘의 데일리 브리핑**\\n\\n**[오늘의 일정]**\\n\${scheduleText}\\n**[대기 중인 주요 이슈]**\\n\${issuesText}\`;

return [{ json: { text: discordMessage } }];
`;
  }
});

fs.writeFileSync('w-daily-fixed.json', JSON.stringify(data, null, 2));
