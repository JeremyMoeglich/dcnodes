<script lang="ts">
	import { tsObjectEntries } from 'ts-type-object-entries';
	import type { passed_data } from '$lib/types/item';

	import InConnector from './in_connector.svelte';
	import OutConnector from './out_connector.svelte';
	import type { io_type } from './default_node/pass_value';

	export let inputs: io_type;
	export let outputs: io_type;
	export let data: passed_data;
</script>

<div class="main">
	{#each tsObjectEntries(inputs) as [name, value]}
		<div>
			<InConnector direction={{ x: -1, y: 0 }} bind:value={value.value} {name} bind:data />
			<p>{name}</p>
		</div>
	{/each}

	{#each tsObjectEntries(outputs) as [name, value]}
		<div>
			<OutConnector direction={{ x: 1, y: 0 }} bind:value={value.value} {name} bind:data />
			<p>{name}</p>
		</div>
	{/each}
</div>

<style>
	.main {
		background-color: gray;
		display: flex;
	}
</style>
