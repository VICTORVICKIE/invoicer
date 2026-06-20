<script lang="ts">
	import InvoiceDocument from '$lib/components/InvoiceDocument.svelte';
	import InvoicePagePreview from '$lib/components/InvoicePagePreview.svelte';
	import InvoiceEditor from '$lib/components/InvoiceEditor.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { getDefaultTemplateId, getTemplateData } from '$lib/invoice/templates';
	import type { InvoiceData } from '$lib/invoice/types';
	import DownloadIcon from '@lucide/svelte/icons/download';

	const fallbackTemplateId = getDefaultTemplateId();
	let templateId = $state(fallbackTemplateId);
	let invoiceData = $state<InvoiceData>(getTemplateData(fallbackTemplateId));

	function handlePrint() {
		const previousTitle = document.title;
		document.title = `Invoice-${invoiceData.invoiceNumber || 'draft'}`;
		window.print();
		document.title = previousTitle;
	}
</script>

<svelte:head>
	<title>Invoicer</title>
</svelte:head>

<div class="app-shell flex min-h-screen w-full max-w-full flex-col overflow-x-clip bg-muted/30">
	<header
		class="app-toolbar sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
	>
		<div
			class="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
		>
			<div class="flex flex-col gap-0.5">
				<h1 class="text-lg font-semibold tracking-tight sm:text-xl">Invoicer</h1>
				<p class="text-xs text-muted-foreground sm:text-sm">
					Edit on the left, preview on the right
				</p>
			</div>
			<Button type="button" class="w-full sm:w-auto" onclick={handlePrint}>
				<DownloadIcon data-icon="inline-start" />
				Download PDF
			</Button>
		</div>
	</header>

	<main class="app-main flex w-full min-w-0 max-w-full flex-1 flex-col overflow-x-clip xl:flex-row xl:items-start">
		<section class="editor-panel w-full min-w-0 max-w-full xl:flex-1">
			<InvoiceEditor bind:data={invoiceData} bind:templateId />
		</section>

		<section
			class="invoice-preview z-0 flex w-full min-w-0 max-w-full flex-col bg-muted/20 xl:sticky xl:top-[4.25rem] xl:min-w-0 xl:flex-1 xl:self-start xl:border-l xl:border-border"
		>
			<div
				class="invoice-preview-header flex flex-col gap-3 border-b bg-muted/40 px-4 py-3 sm:px-6 lg:px-8 xl:hidden print:hidden"
			>
				<h2 class="text-sm font-semibold">Preview</h2>
				<Separator />
			</div>
			<div class="invoice-preview-body flex min-w-0 max-w-full justify-center overflow-x-auto p-4 sm:p-6 lg:p-8">
				<div class="invoice-print-root">
					<InvoiceDocument data={invoiceData} />
				</div>
				<InvoicePagePreview data={invoiceData} />
			</div>
		</section>
	</main>
</div>
