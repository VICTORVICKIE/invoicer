import type { InvoiceData, LineItem } from './types';

const INR_LOCALE = 'en-IN';
const USD_LOCALE = 'en-US';

export function parseNumeric(value: string): number | null {
	const cleaned = value.replace(/[₹$,\s]/g, '').trim();
	if (!cleaned || cleaned === '-') return null;
	const parsed = Number(cleaned);
	return Number.isFinite(parsed) ? parsed : null;
}

export function formatAmount(amount: number, currency: InvoiceData['currency'], symbol: string): string {
	const sym = getCurrencySymbol(currency, symbol);

	if (currency === 'INR') {
		return `${sym}${new Intl.NumberFormat(INR_LOCALE, {
			maximumFractionDigits: 0
		}).format(amount)}`;
	}

	return `${sym}${new Intl.NumberFormat(USD_LOCALE, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(amount)}`;
}

export function getCurrencySymbol(currency: InvoiceData['currency'], symbol: string): string {
	if (currency === 'INR') return '₹';
	if (currency === 'USD') return '$';
	return symbol || '₹';
}

export function stripColumnSuffix(label: string): string {
	return label.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function columnLabelWithCurrency(base: string, currency: InvoiceData['currency'], symbol: string): string {
	const name = stripColumnSuffix(base) || base;
	return `${name} (${getCurrencySymbol(currency, symbol)})`;
}

export function documentHeaderBase(label: string, fallback: string): string {
	return stripColumnSuffix(label) || fallback;
}

export function formatRate(value: number, currency: InvoiceData['currency'], symbol: string): string {
	const sym = getCurrencySymbol(currency, symbol);
	const locale = currency === 'INR' ? INR_LOCALE : USD_LOCALE;

	return `${sym}${new Intl.NumberFormat(locale, {
		maximumFractionDigits: 0
	}).format(value)}`;
}

export function formatDisplayRate(
	rate: string,
	currency: InvoiceData['currency'],
	symbol: string
): string {
	if (!rate.trim()) return rate;

	const parsed = parseNumeric(rate);
	if (parsed === null) return rate;

	return formatRate(parsed, currency, symbol);
}

export function computeLineSubtotal(item: LineItem, currency: InvoiceData['currency'], symbol: string): string {
	if (item.subtotalManual) {
		const parsed = parseNumeric(item.subtotal);
		if (parsed !== null) return formatAmount(parsed, currency, symbol);
		return item.subtotal;
	}

	const effort = parseNumeric(item.effort);
	const rate = parseNumeric(item.rate);
	if (effort === null || rate === null) return item.subtotal;

	return formatAmount(effort * rate, currency, symbol);
}

export function computeInvoiceTotal(data: InvoiceData): string {
	const resolvedItems = lineItemsForDocument(data.lineItems).map((item) => ({
		...item,
		subtotal: computeLineSubtotal(item, data.currency, data.currencySymbol)
	}));

	let total = 0;
	let hasManual = false;

	for (const item of resolvedItems) {
		const parsed = parseNumeric(item.subtotal);
		if (parsed !== null) {
			total += parsed;
		} else if (item.subtotal.trim()) {
			hasManual = true;
		}
	}

	if (hasManual && total === 0 && resolvedItems.length === 1) {
		return resolvedItems[0].subtotal;
	}

	if (total === 0 && resolvedItems.every((item) => !item.subtotal.trim())) {
		return '';
	}

	return formatAmount(total, data.currency, data.currencySymbol);
}

export function isLineItemEmpty(item: LineItem): boolean {
	return !item.description.trim() && !item.effort.trim() && !item.rate.trim();
}

export function lineItemsForDocument(lineItems: LineItem[]): LineItem[] {
	if (lineItems.length === 0) return [];
	if (isLineItemEmpty(lineItems[lineItems.length - 1])) {
		return lineItems.slice(0, -1);
	}
	return lineItems;
}

export function createEmptyLineItem(): LineItem {
	return {
		description: '',
		effort: '',
		rate: '',
		subtotal: '',
		subtotalManual: false
	};
}

export function formatDisplayDate(date: Date = new Date()): string {
	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric'
	}).format(date);
}
