// Module Relationships - Maps which modules can be related to each primary module

export type ModuleType = "Accounts" | "Contacts" | "Deals" | "Leads" | "Tasks";

interface ModuleField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "currency";
}

interface ModuleConfig {
  name: ModuleType;
  label: string;
  icon: string;
  fields: ModuleField[];
  relatedModules: ModuleType[];
}

export const MODULE_CONFIG: Record<ModuleType, ModuleConfig> = {
  Accounts: {
    name: "Accounts",
    label: "Accounts",
    icon: "building",
    fields: [
      { name: "id", label: "Account ID", type: "text" },
      { name: "accountName", label: "Account Name", type: "text" },
      { name: "industry", label: "Industry", type: "select" },
      { name: "revenue", label: "Annual Revenue", type: "currency" },
      { name: "employees", label: "No. of Employees", type: "number" },
      { name: "website", label: "Website", type: "text" },
      { name: "createdDate", label: "Created Date", type: "date" },
      { name: "modifiedDate", label: "Modified Date", type: "date" },
    ],
    relatedModules: ["Deals", "Contacts", "Tasks", "Leads"],
  },
  Contacts: {
    name: "Contacts",
    label: "Contacts",
    icon: "users",
    fields: [
      { name: "id", label: "Contact ID", type: "text" },
      { name: "firstName", label: "First Name", type: "text" },
      { name: "lastName", label: "Last Name", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "title", label: "Job Title", type: "text" },
      { name: "account", label: "Account Name", type: "text" },
      { name: "createdDate", label: "Created Date", type: "date" },
    ],
    relatedModules: ["Accounts", "Deals", "Tasks", "Leads"],
  },
  Deals: {
    name: "Deals",
    label: "Deals",
    icon: "handshake",
    fields: [
      { name: "id", label: "Deal ID", type: "text" },
      { name: "dealName", label: "Deal Name", type: "text" },
      { name: "amount", label: "Deal Amount", type: "currency" },
      { name: "stage", label: "Stage", type: "select" },
      { name: "account", label: "Account Name", type: "text" },
      { name: "contact", label: "Contact Name", type: "text" },
      { name: "closingDate", label: "Expected Close Date", type: "date" },
      { name: "probability", label: "Probability (%)", type: "number" },
      { name: "createdDate", label: "Created Date", type: "date" },
    ],
    relatedModules: ["Accounts", "Contacts", "Tasks", "Leads"],
  },
  Leads: {
    name: "Leads",
    label: "Leads",
    icon: "star",
    fields: [
      { name: "id", label: "Lead ID", type: "text" },
      { name: "firstName", label: "First Name", type: "text" },
      { name: "lastName", label: "Last Name", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "company", label: "Company", type: "text" },
      { name: "leadSource", label: "Lead Source", type: "select" },
      { name: "status", label: "Status", type: "select" },
      { name: "createdDate", label: "Created Date", type: "date" },
    ],
    relatedModules: ["Accounts", "Contacts", "Deals", "Tasks"],
  },
  Tasks: {
    name: "Tasks",
    label: "Tasks",
    icon: "checkbox",
    fields: [
      { name: "id", label: "Task ID", type: "text" },
      { name: "title", label: "Subject", type: "text" },
      { name: "description", label: "Description", type: "text" },
      { name: "dueDate", label: "Due Date", type: "date" },
      { name: "priority", label: "Priority", type: "select" },
      { name: "status", label: "Status", type: "select" },
      { name: "assignedTo", label: "Assigned To", type: "text" },
      { name: "createdDate", label: "Created Date", type: "date" },
    ],
    relatedModules: ["Deals", "Accounts", "Contacts", "Leads"],
  },
};

// Get related modules for a given primary module
export function getRelatedModules(primaryModule: ModuleType): ModuleConfig[] {
  const config = MODULE_CONFIG[primaryModule];
  return config.relatedModules.map(moduleName => MODULE_CONFIG[moduleName]);
}

// Get all fields for a module or combined fields from related modules
export function getModuleFields(moduleName: ModuleType): ModuleField[] {
  return MODULE_CONFIG[moduleName]?.fields || [];
}

// Get combined fields from primary and related modules
export function getCombinedFields(
  primaryModule: ModuleType,
  secondaryModules: ModuleType[]
): { module: ModuleType; fields: ModuleField[] }[] {
  const combined: { module: ModuleType; fields: ModuleField[] }[] = [];

  // Add primary module fields
  combined.push({
    module: primaryModule,
    fields: getModuleFields(primaryModule),
  });

  // Add related module fields
  secondaryModules.forEach(moduleName => {
    if (MODULE_CONFIG[moduleName]) {
      combined.push({
        module: moduleName,
        fields: getModuleFields(moduleName),
      });
    }
  });

  return combined;
}

// Get filter options for a field type
export const FILTER_OPERATORS: Record<string, string[]> = {
  text: ["equals", "contains", "starts with", "ends with", "is empty", "is not empty"],
  number: ["equals", "greater than", "less than", "between", "is empty"],
  date: ["equals", "after", "before", "between", "this month", "this quarter"],
  select: ["equals", "is any of", "is empty"],
  currency: ["equals", "greater than", "less than", "between"],
};

// Sample data for preview modal
export const SAMPLE_DATA: Record<ModuleType, Record<string, any>[]> = {
  Accounts: [
    { id: "ACC-001", accountName: "TechCorp Inc.", industry: "Technology", revenue: "$5.2M", employees: 450, website: "techcorp.com", createdDate: "2024-01-15", modifiedDate: "2024-07-01" },
    { id: "ACC-002", accountName: "Global Finance Ltd", industry: "Finance", revenue: "$12.8M", employees: 1200, website: "globalfinance.com", createdDate: "2023-06-20", modifiedDate: "2024-06-15" },
    { id: "ACC-003", accountName: "Retail Solutions Co", industry: "Retail", revenue: "$3.1M", employees: 180, website: "retailsolutions.com", createdDate: "2024-02-10", modifiedDate: "2024-07-05" },
    { id: "ACC-004", accountName: "Health Systems Plus", industry: "Healthcare", revenue: "$8.9M", employees: 650, website: "healthplus.com", createdDate: "2023-11-05", modifiedDate: "2024-05-20" },
    { id: "ACC-005", accountName: "Manufacturing Pro", industry: "Manufacturing", revenue: "$15.4M", employees: 2100, website: "mfgpro.com", createdDate: "2023-03-12", modifiedDate: "2024-07-08" },
  ],
  Deals: [
    { id: "DEAL-001", dealName: "Q3 Enterprise Package", stage: "Qualification", amount: "$250,000", expectedCloseDate: "2024-09-15", probability: 45, createdDate: "2024-06-01" },
    { id: "DEAL-002", dealName: "Platform Integration", stage: "Proposal", amount: "$125,000", expectedCloseDate: "2024-08-30", probability: 65, createdDate: "2024-05-15" },
    { id: "DEAL-003", dealName: "Annual Renewal", stage: "Negotiation", amount: "$85,000", expectedCloseDate: "2024-07-31", probability: 85, createdDate: "2024-04-20" },
    { id: "DEAL-004", dealName: "Consulting Services", stage: "Qualification", amount: "$45,000", expectedCloseDate: "2024-09-20", probability: 30, createdDate: "2024-06-15" },
    { id: "DEAL-005", dealName: "Implementation Project", stage: "Contract Review", amount: "$320,000", expectedCloseDate: "2024-08-15", probability: 90, createdDate: "2024-03-10" },
  ],
  Leads: [
    { id: "LEAD-001", firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@company.com", phone: "+1-555-0101", status: "Qualified", source: "Webinar", createdDate: "2024-06-20" },
    { id: "LEAD-002", firstName: "Michael", lastName: "Chen", email: "mchen@enterprise.com", phone: "+1-555-0102", status: "Engaged", source: "LinkedIn", createdDate: "2024-06-25" },
    { id: "LEAD-003", firstName: "Emma", lastName: "Rodriguez", email: "emma.r@startup.io", phone: "+1-555-0103", status: "New", source: "Demo Request", createdDate: "2024-07-01" },
    { id: "LEAD-004", firstName: "James", lastName: "Wilson", email: "j.wilson@bigcorp.com", phone: "+1-555-0104", status: "Qualified", source: "Event", createdDate: "2024-05-15" },
    { id: "LEAD-005", firstName: "Lisa", lastName: "Park", email: "lpark@innovate.com", phone: "+1-555-0105", status: "Engaged", source: "Referral", createdDate: "2024-06-10" },
  ],
  Contacts: [
    { id: "CONT-001", firstName: "David", lastName: "Martinez", email: "d.martinez@techcorp.com", phone: "+1-555-0201", title: "VP Engineering", account: "TechCorp Inc.", createdDate: "2024-02-15" },
    { id: "CONT-002", firstName: "Jennifer", lastName: "Lee", email: "j.lee@globalfinance.com", phone: "+1-555-0202", title: "CFO", account: "Global Finance Ltd", createdDate: "2024-01-20" },
    { id: "CONT-003", firstName: "Robert", lastName: "Thompson", email: "r.thompson@retail.com", phone: "+1-555-0203", title: "COO", account: "Retail Solutions Co", createdDate: "2024-03-10" },
    { id: "CONT-004", firstName: "Amanda", lastName: "Scott", email: "a.scott@health.com", phone: "+1-555-0204", title: "Director IT", account: "Health Systems Plus", createdDate: "2024-04-05" },
    { id: "CONT-005", firstName: "Christopher", lastName: "Adams", email: "c.adams@mfg.com", phone: "+1-555-0205", title: "Plant Manager", account: "Manufacturing Pro", createdDate: "2024-05-12" },
  ],
  Tasks: [
    { id: "TASK-001", title: "Follow up with TechCorp", dueDate: "2024-07-15", assignee: "Sarah", priority: "High", status: "In Progress" },
    { id: "TASK-002", title: "Send proposal to Global Finance", dueDate: "2024-07-12", assignee: "Michael", priority: "High", status: "Pending" },
    { id: "TASK-003", title: "Schedule demo with Retail Solutions", dueDate: "2024-07-20", assignee: "Emma", priority: "Medium", status: "Not Started" },
    { id: "TASK-004", title: "Contract review for Health Systems", dueDate: "2024-07-10", assignee: "James", priority: "High", status: "In Progress" },
    { id: "TASK-005", title: "Implementation kickoff Manufacturing", dueDate: "2024-07-18", assignee: "Lisa", priority: "Medium", status: "Scheduled" },
  ],
};
