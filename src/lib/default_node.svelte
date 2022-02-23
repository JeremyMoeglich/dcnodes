<script lang="ts">
	import { watchResize } from 'svelte-watch-resize';
	import type { item_type } from '$lib/types/item';

	import Connector from '../connector.svelte';
	import type { io_type } from './default_node/pass_value';
	import { typed_entries } from './utilities/typed_entries';

	export let inputs: io_type;
	export let outputs: io_type;
	export let item: item_type;
</script>

<div>
	{#each typed_entries(inputs) as [name, value]}
		<Connector type="in" bind:value={value.value} {name} bind:item />
		<p>{name}</p>
	{/each}

	{#each typed_entries(outputs) as [name, value]}
		<Connector type="out" bind:value={value.value} {name} bind:item />
		<p>{name}</p>
	{/each}
</div>
