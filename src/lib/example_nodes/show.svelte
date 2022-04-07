<script lang="ts">
	import InConnector from '$lib/in_connector.svelte';
	import type { data_refrence } from '$lib/types/item';

	export let data: data_refrence;
	let value: unknown;
</script>

<div class="box">
	<InConnector {data} bind:value name="value" />
	<p>{JSON.stringify(value)}</p>
</div>

<style>
	.box {
		width: 100px;
		height: 70px;
        background-color: gray;
	}
</style>
