const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Import the new view
code = code.replace("import { PostProcessingInventory } from './components/PostProcessingInventory';", "import { PostProcessingInventory } from './components/PostProcessingInventory';\nimport { DesignServicesView } from './components/DesignServicesView';");

// Add the view route
code = code.replace("{activeView === 'tasks' && <PostProcessingInventory />}", "{activeView === 'tasks' && <PostProcessingInventory />}\n            {activeView === 'services' && <DesignServicesView />}");

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx");
