export interface LineItem {
	description: string;
	effort: string;
	rate: string;
	subtotal: string;
	subtotalManual: boolean;
}

export interface InvoiceColumns {
	effort: string;
	rate: string;
	subtotal: string;
}

export interface InvoiceData {
	invoiceNumber: string;
	date: string;
	fromAddress: string;
	toAddress: string;
	columns: InvoiceColumns;
	currency: 'INR' | 'USD' | 'custom';
	currencySymbol: string;
	totalLabel: string;
	lineItems: LineItem[];
}

export interface InvoiceTemplateFile {
	label: string;
	editableSettings?: boolean;
	data: InvoiceData;
}

export type InvoiceTemplateId = string;

export interface InvoiceTemplate {
	id: string;
	label: string;
	editableSettings: boolean;
	data: InvoiceData;
}
