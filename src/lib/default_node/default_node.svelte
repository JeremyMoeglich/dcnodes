<script lang="ts">
	import InConnector from '../in_connector.svelte';
	import OutConnector from '../out_connector.svelte';
	import type { default_node_props } from './pass_value';
	import type { data_refrence } from '../types/item';

	export let inputs: default_node_props<string, string>['inputs'];
	export let outputs: default_node_props<string, string>['outputs'];
	export let fn: default_node_props<string, string>['fn'];
	export let data: data_refrence;

	let input_values: Record<string, unknown> = {};
	$: output_values = fn(input_values);
</script>

<div class="main">
	<div class="side">
		{#each inputs as name}
			<div>
				<InConnector bind:value={input_values[name]} {name} {data} />
				<p>{name}</p>
			</div>
		{/each}
	</div>

	<div class="side">
		{#each outputs as name}
			<div>
				<p>{name}</p>
				<OutConnector value={output_values[name]} {name} {data} />
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
