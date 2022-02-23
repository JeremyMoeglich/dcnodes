<script lang="ts">
	import { union } from 'lodash-es';
import { unionBy } from 'lodash-es';

	import { omit } from 'lodash-es';

	import { setContext } from 'svelte';

	import type { item_type, internal_item_type, position } from './types/item';

	export let items: Array<item_type>;
	export let internal_items: Array<internal_item_type> = items.map();
	$: items.map((item) => {
		item.position = item.position ?? { x: 0, y: 0 };
	});
	let container: HTMLElement;
	$: {
		const position = omit(container.getBoundingClientRect(), ['height', 'width']) as position;
		setContext('sveltedc_position', position);
	}
	$: internal_items.map();
</script>

<div class="main" bind:this={container}>
	<div class="nodes">
		{#each items as item}
			<div class="item" style={`translate(${item.position?.x ?? 0}px, ${item.position?.y ?? 0}px)`}>
				<svelte:component this={item.component} {...item.props} bind:item />
			</div>
		{/each}
	</div>
	<div class="connections" />
</div>

<style>
	.main {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.item {
		position: absolute;
		top: 0px;
		left: 0px;
		width: fit-content;
		height: fit-content;
	}
</style>
