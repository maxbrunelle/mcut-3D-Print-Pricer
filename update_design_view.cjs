const fs = require('fs');
let code = fs.readFileSync('src/components/DesignServicesView.tsx', 'utf8');

// Replace standard ExtraItem terminology with DesignService
code = code.replace(/ExtraItemInventory/g, 'DesignServicesView');
code = code.replace(/Extra Items/g, 'CAD & Scanning Services');
code = code.replace(/extra item/g, 'design service');
code = code.replace(/Extra Item/g, 'Design Service');
code = code.replace(/inventoryExtraItems/g, 'inventoryDesignServices');
code = code.replace(/InventoryExtraItem/g, 'InventoryDesignService');
code = code.replace(/box/gi, 'pen-tool'); // generic icon name

// We need to change the fields. It has name, price, quantity, rebuyLink.
// We want name, pricePerHour.
code = code.replace(/quantity: 1,/g, '');
code = code.replace(/quantity: e.target.valueAsNumber/g, '');
code = code.replace(/rebuyLink: ''/g, '');

// Since this was a basic search/replace, let's actually just write the file directly because it might be a mess.
