<script lang="ts">
	import InConnector from './in_connector.svelte';
	import OutConnector from './out_connector.svelte';
	import type { io_type } from './default_node/pass_value';
	import { typed_entries } from './utilities/typed_entries';
	import type { data_refrence } from './types/item';

	export let inputs: io_type;
	export let outputs: io_type;
	export let data: data_refrence;
	let change_index = 0;
	data.set_on_change(() => {
		change_index++;
	});
</script>

{#key change_index}
	<p>
		{data.id}
		{data._get_drag_value()}
		{JSON.stringify(data.get_current_item().node_connections)}
		{!(data._get_drag_value() <= 0) === true}
	</p>
{/key}

<div class="main">
	<div class="side">
		{#each typed_entries(inputs) as [name, value]}
			<div>
				<InConnector direction={{ x: -1, y: 0 }} bind:value={value.value} {name} {data} />
				<p>{name}</p>
			</div>
		{/each}
	</div>

	<div class="side">
		{#each typed_entries(outputs) as [name, value]}
			<div>
				<p>{name}</p>
				<OutConnector direction={{ x: 1, y: 0 }} bind:value={value.value} {name} {data} />
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
		color: white;
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
