<script lang="ts">

	import { Button } from '$lib/components/ui/button/index.js';

	import * as Card from '$lib/components/ui/card/index.js';

	import * as Field from '$lib/components/ui/field/index.js';

	import { Input } from '$lib/components/ui/input/index.js';

	import * as Select from '$lib/components/ui/select/index.js';

	import { Textarea } from '$lib/components/ui/textarea/index.js';

	import {

		columnLabelWithCurrency,

		computeLineSubtotal,

		createEmptyLineItem,

		getCurrencySymbol,

		isLineItemEmpty,

		stripColumnSuffix

	} from '$lib/invoice/format';

	import { getTemplate, getTemplateData, invoiceTemplates } from '$lib/invoice/templates';

	import type { InvoiceData, LineItem } from '$lib/invoice/types';

	import Trash2Icon from '@lucide/svelte/icons/trash-2';



	let {

		data = $bindable(),

		templateId = $bindable()

	}: {

		data: InvoiceData;

		templateId: string;

	} = $props();



	const editableSettings = $derived(getTemplate(templateId).editableSettings);

	const templateLabel = $derived(

		invoiceTemplates.find((template) => template.id === templateId)?.label ?? 'Select template'

	);



	const currencyOptions = [

		{ value: 'INR', label: 'INR (₹)' },

		{ value: 'USD', label: 'USD ($)' },

		{ value: 'custom', label: 'Custom' }

	] as const;



	const currencyLabel = $derived(

		currencyOptions.find((option) => option.value === data.currency)?.label ?? 'Currency'

	);



	const currencySymbol = $derived(getCurrencySymbol(data.currency, data.currencySymbol));



	const effortLabel = $derived(stripColumnSuffix(data.columns.effort) || 'Effort');

	const rateLabel = $derived(columnLabelWithCurrency(data.columns.rate, data.currency, data.currencySymbol));

	const subtotalLabel = $derived(

		columnLabelWithCurrency(data.columns.subtotal, data.currency, data.currencySymbol)

	);



	function selectTemplate(id: string) {

		if (!id || id === templateId) return;

		templateId = id;

		data = getTemplateData(id);

	}



	function syncCurrencyColumns() {

		const sym = getCurrencySymbol(data.currency, data.currencySymbol);

		data.columns.rate = columnLabelWithCurrency(data.columns.rate, data.currency, data.currencySymbol);

		data.columns.subtotal = columnLabelWithCurrency(

			data.columns.subtotal,

			data.currency,

			data.currencySymbol

		);

		const totalBase = stripColumnSuffix(data.totalLabel) || 'Total due';

		data.totalLabel = `${totalBase} (${sym})`;

	}



	function recalcAllLineItems() {

		data.lineItems = data.lineItems.map((item) => {

			const next = { ...item, subtotalManual: false };

			next.subtotal = computeLineSubtotal(next, data.currency, data.currencySymbol);

			return next;

		});

	}



	function setCurrency(value: string | undefined) {

		if (!value || value === data.currency) return;

		data.currency = value as InvoiceData['currency'];

		syncCurrencyColumns();

		recalcAllLineItems();

	}



	function setCurrencySymbol(value: string) {

		data.currencySymbol = value;

		if (data.currency === 'custom') {

			syncCurrencyColumns();

			recalcAllLineItems();

		}

	}



	function ensureTrailingEmptyRow() {

		const items = data.lineItems;

		if (items.length === 0) {

			data.lineItems = [createEmptyLineItem()];

			return;

		}

		if (!isLineItemEmpty(items[items.length - 1])) {

			data.lineItems = [...items, createEmptyLineItem()];

		}

	}



	$effect(() => {

		data.lineItems;

		ensureTrailingEmptyRow();

	});



	function removeLineItem(index: number) {

		if (data.lineItems.length <= 1) return;

		data.lineItems = data.lineItems.filter((_, i) => i !== index);

	}



	function updateLineItem(index: number, field: 'description' | 'effort' | 'rate', value: string) {

		data.lineItems = data.lineItems.map((item, i) => {

			if (i !== index) return item;

			if (field === 'description') return { ...item, description: value };

			const next = { ...item, [field]: value, subtotalManual: false };

			next.subtotal = computeLineSubtotal(next, data.currency, data.currencySymbol);

			return next;

		});

	}



	function lineSubtotal(item: LineItem): string {

		return computeLineSubtotal(item, data.currency, data.currencySymbol);

	}

</script>



<div class="mx-auto flex w-full min-w-0 flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 xl:py-6">

	<div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
		<Card.Root class="overflow-visible">
			<Card.Header>
				<Card.Title>Template</Card.Title>
				<Card.Description>Choose a client preset to load addresses and column settings.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Field.Group>
					<Field.Field>
						<Field.Label for="template-select">Client preset</Field.Label>
						<Select.Root
							type="single"
							value={templateId}
							onValueChange={(value: string | undefined) => value && selectTemplate(value)}
						>
							<Select.Trigger id="template-select" class="w-full">
								{templateLabel}
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each invoiceTemplates as template (template.id)}
										<Select.Item value={template.id} label={template.label}>
											{template.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</Field.Group>
			</Card.Content>
		</Card.Root>

		<Card.Root class="overflow-visible">
			<Card.Header>
				<Card.Title>Invoice details</Card.Title>
			</Card.Header>
			<Card.Content>
				<Field.Group>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label for="invoice-number">Invoice number</Field.Label>
							<Input id="invoice-number" bind:value={data.invoiceNumber} />
						</Field.Field>
						<Field.Field>
							<Field.Label for="invoice-date">Date</Field.Label>
							<Input id="invoice-date" bind:value={data.date} />
						</Field.Field>
					</div>
				</Field.Group>
			</Card.Content>
		</Card.Root>
	</div>



	<Card.Root class="overflow-visible">

		<Card.Header>

			<Card.Title>Addresses</Card.Title>

		</Card.Header>

		<Card.Content>

			<Field.Group>

				<div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">

					<Field.Field class="flex min-h-32 flex-col">

						<Field.Label for="from-address">From</Field.Label>

						<Textarea
							id="from-address"
							class="min-h-32 flex-1 resize-y lg:min-h-0"
							bind:value={data.fromAddress}
						/>

					</Field.Field>

					<Field.Field class="flex min-h-32 flex-col">

						<Field.Label for="to-address">To</Field.Label>

						<Textarea
							id="to-address"
							class="min-h-32 flex-1 resize-y lg:min-h-0"
							bind:value={data.toAddress}
						/>

					</Field.Field>

				</div>

			</Field.Group>

		</Card.Content>

	</Card.Root>



	{#if editableSettings}

		<Card.Root class="overflow-visible">

			<Card.Header>

				<Card.Title>Column settings</Card.Title>

				<Card.Description>Customize table header labels on the invoice.</Card.Description>

			</Card.Header>

			<Card.Content>

				<Field.Group>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">

						<Field.Field>

							<Field.Label for="effort-column">Effort column</Field.Label>

							<Input id="effort-column" bind:value={data.columns.effort} />

						</Field.Field>

						<Field.Field>

							<Field.Label for="rate-column">Rate column</Field.Label>

							<Input id="rate-column" bind:value={data.columns.rate} />

						</Field.Field>

						<Field.Field>

							<Field.Label for="subtotal-column">Subtotal column</Field.Label>

							<Input id="subtotal-column" bind:value={data.columns.subtotal} />

						</Field.Field>

					</div>

					<Field.Field>

						<Field.Label for="total-label">Total label</Field.Label>

						<Input id="total-label" bind:value={data.totalLabel} />

					</Field.Field>

				</Field.Group>

			</Card.Content>

		</Card.Root>

	{/if}



	<Card.Root class="overflow-visible">

		<Card.Header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

			<Card.Title class="shrink-0">Line items</Card.Title>

			<div class="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">

				<Field.Field class="min-w-0 sm:w-36">

					<Field.Label for="line-currency">Currency</Field.Label>

					<Select.Root type="single" value={data.currency} onValueChange={setCurrency}>

						<Select.Trigger id="line-currency" class="w-full">

							{currencyLabel}

						</Select.Trigger>

						<Select.Content>

							<Select.Group>

								{#each currencyOptions as option (option.value)}

									<Select.Item value={option.value} label={option.label}>

										{option.label}

									</Select.Item>

								{/each}

							</Select.Group>

						</Select.Content>

					</Select.Root>

				</Field.Field>

				{#if data.currency === 'custom'}

					<Field.Field class="w-full sm:w-20">

						<Field.Label for="line-currency-symbol">Symbol</Field.Label>

						<Input

							id="line-currency-symbol"

							value={data.currencySymbol}

							oninput={(event) => setCurrencySymbol(event.currentTarget.value)}

						/>

					</Field.Field>

				{/if}

			</div>

		</Card.Header>

		<Card.Content>

			<div class="min-w-0 overflow-x-auto">

			<div

				class="mb-2 hidden gap-2 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_6rem_8rem_6.5rem_2rem]"

			>

				<span>Description</span>

				<span>{effortLabel}</span>

				<span>{rateLabel}</span>

				<span class="text-right">{subtotalLabel}</span>

				<span></span>

			</div>



			<div class="flex flex-col divide-y">

				{#each data.lineItems as item, index (index)}

					<div class="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_6rem_8rem_6.5rem_2rem] sm:items-center sm:gap-2">

						<Field.Field class="min-w-0 sm:col-span-1">

							<Field.Label for="description-{index}" class="sm:sr-only">Description</Field.Label>

							<Input

								id="description-{index}"

								placeholder="Description"

								value={item.description}

								oninput={(event) =>

									updateLineItem(index, 'description', event.currentTarget.value)}

							/>

						</Field.Field>



						<Field.Field class="min-w-0">

							<Field.Label for="effort-{index}" class="text-xs sm:sr-only">{effortLabel}</Field.Label>

							<Input

								id="effort-{index}"

								class="tabular-nums"

								placeholder={effortLabel}

								value={item.effort}

								oninput={(event) => updateLineItem(index, 'effort', event.currentTarget.value)}

							/>

						</Field.Field>



						<Field.Field class="min-w-0">

							<Field.Label for="rate-{index}" class="text-xs sm:sr-only">{rateLabel}</Field.Label>

							<div

								class="flex h-9 w-full min-w-0 overflow-hidden rounded-md border border-input bg-transparent shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"

							>

								<span

									class="flex shrink-0 items-center border-r border-input bg-muted/60 px-2.5 text-sm font-medium text-muted-foreground"

								>

									{currencySymbol}

								</span>

								<input

									id="rate-{index}"

									class="min-w-0 flex-1 bg-transparent px-2 text-sm tabular-nums outline-none placeholder:text-muted-foreground"

									placeholder="0"

									value={item.rate}

									oninput={(event) => updateLineItem(index, 'rate', event.currentTarget.value)}

								/>

							</div>

						</Field.Field>



						<p class="text-right text-sm font-semibold tabular-nums text-foreground">

							{lineSubtotal(item) || '—'}

						</p>



						<div class="flex justify-end sm:justify-center">

							<Button

								type="button"

								variant="ghost"

								size="icon-sm"

								class="text-destructive hover:text-destructive"

								disabled={data.lineItems.length <= 1}

								onclick={() => removeLineItem(index)}

								aria-label="Remove line item"

							>

								<Trash2Icon />

							</Button>

						</div>

					</div>

				{/each}

			</div>

			</div>

		</Card.Content>

	</Card.Root>

</div>


