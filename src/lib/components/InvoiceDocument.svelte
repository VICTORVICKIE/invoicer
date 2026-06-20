<script lang="ts">
	import { assets } from '$app/paths';
	import '$lib/invoice/invoice.css';
	import {
		computeInvoiceTotal,
		computeLineSubtotal,
		documentHeaderBase,
		formatDisplayRate,
		lineItemsForDocument
	} from '$lib/invoice/format';
	import type { InvoiceData } from '$lib/invoice/types';

	let { data }: { data: InvoiceData } = $props();

	const lineItems = $derived(
		lineItemsForDocument(data.lineItems).map((item) => ({
			...item,
			displayRate: formatDisplayRate(item.rate, data.currency, data.currencySymbol),
			displaySubtotal: computeLineSubtotal(item, data.currency, data.currencySymbol)
		}))
	);

	const totalDue = $derived(computeInvoiceTotal(data));

	const effortHeader = $derived(data.columns.effort);
	const rateHeader = $derived(documentHeaderBase(data.columns.rate, 'Rate'));
	const subtotalHeader = $derived(documentHeaderBase(data.columns.subtotal, 'Subtotal'));
	const totalHeader = $derived(documentHeaderBase(data.totalLabel, 'Total due'));
</script>

<div class="invoice-document">
	<div class="header-row">
		<div class="header-left">
			<img src={`${assets}/logo.svg`} alt="Logo" class="logo" />
			<h1>Invoice</h1>
		</div>
		<div class="header-right">
			<div class="invoice-info">
				<div><span class="label">Invoice Number:</span> {data.invoiceNumber}</div>
				<div><span class="label">Date:</span> {data.date}</div>
			</div>
		</div>
	</div>

	<aside>
		<address id="from">{data.fromAddress}</address>
		<address id="to">{data.toAddress}</address>
	</aside>

	<table>
		<thead>
			<tr>
				<th>Description</th>
				<th>{effortHeader}</th>
				<th>{rateHeader}</th>
				<th>{subtotalHeader}</th>
			</tr>
		</thead>
		<tbody>
			{#each lineItems as item}
				<tr>
					<td>{item.description}</td>
					<td>{item.effort}</td>
					<td>{item.displayRate}</td>
					<td>{item.displaySubtotal}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<footer>
		<table id="total">
			<thead>
				<tr>
					<th></th>
					<th></th>
					<th>{totalHeader}</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td></td>
					<td></td>
					<td>{totalDue}</td>
				</tr>
			</tbody>
		</table>
		<div class="invoice-footer print-footer">
			<span><span class="invoice-footer-heart" aria-hidden="true">♥</span> Thank you!</span>
			<span>s.vickie14@gmail.com</span>
		</div>
	</footer>
</div>
