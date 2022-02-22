<script lang="ts">
	import { getContext, setContext, SvelteComponentTyped } from 'svelte';
	import { omit } from 'lodash-es';
	type nodes_type = Array<{
		component: new (...args: unknown[]) => SvelteComponentTyped<Omit<nodes_type, 'component'>>;
		position: undefined | { x: number; y: number };
		props: Record<string, unknown>;
	}>;
	export let items: nodes_type;

	const current_layer: number = getContext('sveltedc-current-layer') ?? 0;
	setContext('svelte-current-layer', current_layer + 1);
	
</script>

{#each items as item}
	<svelte:component this={item.component} {...item.props} bind:items/>
{/each}
