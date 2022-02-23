<script lang="ts">
	import type { item_type } from './types/item';

	export let items: Array<item_type>;
	$: items.map((item) => {
		item.position = item.position ?? { x: 0, y: 0 };
	});
</script>

<div class="main">
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
	}
</style>
