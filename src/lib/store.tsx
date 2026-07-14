import React, { useState, createContext, useContext, useEffect } from 'react';

export interface PrintMaterial {
  id: string;
  name: string;
  costPerKg: number;
  weight: number;
  spoolId?: string;
}

export interface Customer {
  id: string;
  clientNumber: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Spool {
  id: string;
  name: string;
  material: string;
  color: string;
  colorHex: string;
  originalWeight: number;
  remainingWeight: number;
  cost: number;
}

export interface SpoolDeduction {
  spoolId: string;
  weightUsed: number;
}

export interface Invoice {
  savedState?: any;
  id: string;
  invoiceNumber?: string;
  date: string;
  partName: string;
  customerName: string;
  totalAmount: number;
  pdfDataUri: string;
  status?: 'Quoted' | 'Printing' | 'Post-Processing' | 'Completed';
  extraItems?: ExtraItem[];
  spoolDeductions?: SpoolDeduction[];
}



export interface MaintenanceLog {
  id: string;
  date: string;
  task: string;
  cost: number;
  notes: string;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
  powerWatts: number;
  cost: number;
  lifespanHours: number;
  maintenanceLogs?: MaintenanceLog[];
}

export interface ProjectPart {
  id: string;
  name: string;
  isMultiMaterial: boolean;
  materials: PrintMaterial[];
  printTimeHrs: number;
  printTimeMin: number;
  quantity: number;
  printerId?: string;
}

export interface PostProcessingTask {
  id: string;
  name: string;
  timeMin: number;
}

export interface ExtraItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  inventoryItemId?: string;
}

export interface InventoryExtraItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  rebuyLink?: string;
}

export interface CalculatorState {
  editingInvoiceId?: string | null;
  projectName: string;
  parts: ProjectPart[];
  selectedCustomerId: string | null;
  customers: Customer[];
  nextClientNumber: number;
  nextInvoiceNumber: number;
  invoices: Invoice[];
  spools: Spool[];
  printers: Printer[];
  postProcessingTasks: PostProcessingTask[];
  extraItems: ExtraItem[];
  inventoryExtraItems: InventoryExtraItem[];
  
  laborTimeMin: number;
  hardwareCost: number;
  packagingCost: number;
  shippingCost: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applyTaxes: boolean;
  gstRate: number;
  qstRate: number;
  paymentTerms: string;
  invoiceNotes: string;
  
  // Advanced Settings
  electricityCost: number;
  printerPower: number;
  printerCost: number;
  printerLifespanHours: number;
  laborRatePerHour: number;
  failureRate: number;
  customMargin: number;
  selectedMargin: number;

  appLogo: string | null;
  invoiceLogo: string | null;
  companyName?: string;
  companyStreet?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyCountry?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  currency?: string;
  dateFormat?: string;

  appTheme: string;
  isDarkMode: boolean;
  animationsEnabled: {
    popups: boolean;
    jobTracker?: boolean;
    numbers: boolean;
    layouts: boolean;
  };
}

interface AppState {
  state: CalculatorState;
  updateState: (updates: Partial<CalculatorState>) => void;
}

const defaultState: CalculatorState = {
  projectName: '',
  parts: [
    {
      id: '1',
      name: '',
      isMultiMaterial: false,
      materials: [
        { id: '1', name: 'PLA', costPerKg: 25, weight: 0 }
      ],
      printTimeHrs: 0,
      printTimeMin: 0,
      quantity: 1,
    }
  ],
  selectedCustomerId: null,
  customers: [],
  nextClientNumber: 1,
  nextInvoiceNumber: 1,
  invoices: [],
  printers: [
    { id: '1', name: 'Prusa MK3S+', model: 'MK3S+', powerWatts: 250, cost: 800, lifespanHours: 10000 }
  ],
  spools: [
    {
      id: '1',
      name: 'PolyTerra Charcoal Black',
      material: 'PLA',
      color: 'Black',
      colorHex: '#222222',
      originalWeight: 1000,
      remainingWeight: 850,
      cost: 29.99
    },
    {
      id: '2',
      name: 'Prusament Galaxy Silver',
      material: 'PLA',
      color: 'Silver',
      colorHex: '#C0C0C0',
      originalWeight: 1000,
      remainingWeight: 350,
      cost: 39.99
    }
  ],
  postProcessingTasks: [],
  extraItems: [],
  inventoryExtraItems: [],
  laborTimeMin: 0,
  hardwareCost: 0,
  packagingCost: 0,
  shippingCost: 0,
  discountType: 'percentage',
  discountValue: 0,
  applyTaxes: true,
  gstRate: 5,
  qstRate: 9.975,
  paymentTerms: 'Due on Receipt',
  invoiceNotes: 'Thank you for your business!',
  
  electricityCost: 0.15,
  printerPower: 150,
  printerCost: 800,
  printerLifespanHours: 4000,
  laborRatePerHour: 20,
  failureRate: 0,
  customMargin: 50,
  selectedMargin: 40,
  appLogo: null,
  invoiceLogo: null,
  companyName: '',
  companyStreet: '',
  companyCity: '',
  companyState: '',
  companyZip: '',
  companyCountry: '',
  companyEmail: '',
  companyPhone: '',
  companyWebsite: '',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',

  appTheme: 'indigo-cyan',
  isDarkMode: false,
  animationsEnabled: {
    popups: true,
    jobTracker: true,
    numbers: true,
    layouts: true,
  },
};

const STORAGE_KEY = '3d-pricer-state';

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CalculatorState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Migration from single part to multi-part
        if (parsed.partName !== undefined && !parsed.parts) {
          parsed.parts = [{
            id: Math.random().toString(),
            name: parsed.partName,
            isMultiMaterial: parsed.isMultiMaterial || false,
            materials: parsed.materials || [],
            printTimeHrs: parsed.printTimeHrs || 0,
            printTimeMin: parsed.printTimeMin || 0,
            quantity: parsed.quantity || 1,
          }];
          parsed.projectName = parsed.partName;
          delete parsed.partName;
          delete parsed.isMultiMaterial;
          delete parsed.materials;
          delete parsed.printTimeHrs;
          delete parsed.printTimeMin;
          delete parsed.quantity;
        }

        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load state from local storage', e);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to local storage', e);
    }
  }, [state]);

  const updateState = (updates: Partial<CalculatorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

