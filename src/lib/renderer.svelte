<script lang="ts">
	import type { SvelteComponentTyped } from 'svelte';
	import { omit } from 'lodash-es';
	type items_type = Array<{
		component: new (...args: unknown[]) => SvelteComponentTyped<Omit<items_type, 'component'>>;
		props: Record<string, unknown>;
	}>;
	export let items: items_type;
</script>

{#each items as item}
	<svelte:component this={item.component} {...item.props} />
{/each}
