<script lang="ts">
	import InvoiceDocument from '$lib/components/InvoiceDocument.svelte';
	import type { InvoiceData } from '$lib/invoice/types';
	import { tick } from 'svelte';

	let { data }: { data: InvoiceData } = $props();

	let measureRoot: HTMLDivElement | undefined = $state();
	let contentAreaEl: HTMLDivElement | undefined = $state();
	let pageCount = $state(1);

	async function remeasure() {
		await tick();
		if (!measureRoot || !contentAreaEl) return;

		const contentHeight = measureRoot.scrollHeight;
		const pageHeight = contentAreaEl.clientHeight;
		if (pageHeight <= 0) return;

		pageCount = Math.max(1, Math.ceil(contentHeight / pageHeight));
	}

	$effect(() => {
		data;
		void remeasure();
	});

	$effect(() => {
		if (!measureRoot) return;

		const observer = new ResizeObserver(() => {
			void remeasure();
		});
		observer.observe(measureRoot);

		return () => observer.disconnect();
	});
</script>

<div class="invoice-page-measure" aria-hidden="true">
	<div class="invoice-page-shell">
		<div class="invoice-page-content-area" bind:this={contentAreaEl}>
			<div bind:this={measureRoot}>
				<InvoiceDocument {data} />
			</div>
		</div>
	</div>
</div>

<div class="invoice-page-preview">
	{#each { length: pageCount } as _, pageIndex (pageIndex)}
		<div class="invoice-page-shell">
			<div class="invoice-page-content-area">
				<div
					class="invoice-page-shift"
					style:margin-top="calc(-{pageIndex} * var(--invoice-page-content-height))"
				>
					<InvoiceDocument {data} />
				</div>
			</div>
			{#if pageIndex === pageCount - 1}
				<div class="invoice-footer">
					<span><span class="invoice-footer-heart" aria-hidden="true">♥</span> Thank you!</span>
					<span>s.vickie14@gmail.com</span>
				</div>
			{/if}
		</div>
	{/each}
</div>
