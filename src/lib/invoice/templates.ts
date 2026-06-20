import { createEmptyLineItem, formatDisplayDate } from './format';
import type { InvoiceData, InvoiceTemplate, InvoiceTemplateFile } from './types';

const templateModules = import.meta.glob('./template-files/*.json', {
	eager: true,
	import: 'default'
}) as Record<string, InvoiceTemplateFile>;

function cloneData(data: InvoiceData): InvoiceData {
	return structuredClone(data);
}

function normalizeData(raw: InvoiceData, id: string): InvoiceData {
	const lineItems =
		raw.lineItems?.length > 0
			? raw.lineItems.map((item) => ({
					description: item.description ?? '',
					effort: item.effort ?? '',
					rate: item.rate ?? '',
					subtotal: item.subtotal ?? '',
					subtotalManual: item.subtotalManual ?? false
				}))
			: [createEmptyLineItem()];

	const data: InvoiceData = {
		invoiceNumber: raw.invoiceNumber ?? '',
		date: raw.date || formatDisplayDate(),
		fromAddress: raw.fromAddress ?? '',
		toAddress: raw.toAddress ?? '',
		columns: {
			effort: raw.columns?.effort ?? 'Effort',
			rate: raw.columns?.rate ?? 'Rate',
			subtotal: raw.columns?.subtotal ?? 'Subtotal'
		},
		currency: raw.currency ?? 'custom',
		currencySymbol: raw.currencySymbol ?? '₹',
		totalLabel: raw.totalLabel ?? 'Total due',
		lineItems
	};

	return data;
}

function loadTemplates(): InvoiceTemplate[] {
	return Object.entries(templateModules)
		.map(([path, file]) => {
			const id = path.match(/\/([^/]+)\.json$/)?.[1];
			if (!id) return null;

			return {
				id,
				label: file.label || id,
				editableSettings: file.editableSettings ?? false,
				data: normalizeData(file.data, id)
			} satisfies InvoiceTemplate;
		})
		.filter((template): template is InvoiceTemplate => template !== null)
		.sort((a, b) => a.label.localeCompare(b.label));
}

export const invoiceTemplates: InvoiceTemplate[] = loadTemplates();

export function getDefaultTemplateId(): string {
	return invoiceTemplates.find((template) => template.id === 'elbrit')?.id ?? invoiceTemplates[0]?.id ?? 'custom';
}

export function getTemplate(id: string): InvoiceTemplate {
	const template = invoiceTemplates.find((entry) => entry.id === id);
	if (!template) throw new Error(`Unknown template: ${id}`);
	return template;
}

export function getTemplateData(id: string): InvoiceData {
	const data = cloneData(getTemplate(id).data);
	data.date = formatDisplayDate();
	return data;
}

export function resolveTemplateId(id: string): string {
	if (invoiceTemplates.some((template) => template.id === id)) return id;
	return getDefaultTemplateId();
}
