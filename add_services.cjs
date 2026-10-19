const fs = require('fs');
let code = fs.readFileSync('src/lib/store.tsx', 'utf8');

// Add interfaces
const interfaces = `export interface InventoryDesignService {
  id: string;
  name: string;
  pricePerHour: number;
}

export interface DesignTask {
  id: string;
  name: string;
  timeHrs: number;
  timeMin: number;
  pricePerHour: number;
  inventoryServiceId?: string;
}
`;

code = code.replace("export interface ExtraItem", interfaces + "\nexport interface ExtraItem");

// Add to CalculatorState
const stateAdditions = `  inventoryDesignServices?: InventoryDesignService[];
  designTasks?: DesignTask[];
`;

code = code.replace("  inventoryPostProcessingTasks: PostProcessingTask[];", "  inventoryPostProcessingTasks: PostProcessingTask[];\n" + stateAdditions);
code = code.replace("'history' | 'spools' | 'items' | 'printers' | 'customers' | 'tasks'", "'history' | 'spools' | 'items' | 'printers' | 'customers' | 'tasks' | 'services'");

// Update defaultState
const defaultStateAdditions = `  inventoryDesignServices: [
    { id: '1', name: '3D Scanning', pricePerHour: 50 },
    { id: '2', name: 'CAD Design', pricePerHour: 45 }
  ],
  designTasks: [],
`;

code = code.replace("  inventoryPostProcessingTasks: [", defaultStateAdditions + "  inventoryPostProcessingTasks: [");

fs.writeFileSync('src/lib/store.tsx', code);
console.log("Updated store.tsx");
