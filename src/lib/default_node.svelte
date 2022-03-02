<script lang="ts">
	import type { passed_data } from '$lib/types/item';

	import InConnector from './in_connector.svelte';
	import OutConnector from './out_connector.svelte';
	import type { io_type } from './default_node/pass_value';
	import { typed_entries } from './utilities/typed_entries';

	export let inputs: io_type;
	export let outputs: io_type;
	export let data: passed_data;
</script>

<div class="main">
	<div class="side">
		{#each typed_entries(inputs) as [name, value]}
			<div>
				<InConnector direction={{ x: -1, y: 0 }} bind:value={value.value} {name} bind:data />
				<p>{name}</p>
			</div>
		{/each}
	</div>

	<div class="side">
		{#each typed_entries(outputs) as [name, value]}
			<div>
				<p>{name}</p>
				<OutConnector direction={{ x: 1, y: 0 }} bind:value={value.value} {name} bind:data />
			</div>
		{/each}
	</div>
</div>

<style>
	.main {
		background-color: gray;
		display: flex;
		gap: 15px;
	}
	p {
		margin: 0px;
	}
	.main > div {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.main > div > div {
		display: flex;
		justify-content: space-between;
	}
</style>
