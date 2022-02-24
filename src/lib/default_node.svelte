<script lang="ts">
	import { tsObjectEntries } from 'ts-type-object-entries';
	import type { internal_item_type } from '$lib/types/item';

	import Connector from './connector.svelte';
	import type { io_type } from './default_node/pass_value';

	export let inputs: io_type;
	export let outputs: io_type;
	export let item: internal_item_type;
</script>

<div>
	{#each tsObjectEntries(inputs) as [name, value]}
		<Connector direction={{x: -1, y: 0}} type="in" bind:value={value.value} {name} bind:item />
		<p>{name}</p>
	{/each}

	{#each tsObjectEntries(outputs) as [name, value]}
		<Connector direction={{x: 1, y: 0}}  type="out" bind:value={value.value} {name} bind:item />
		<p>{name}</p>
	{/each}
</div>
