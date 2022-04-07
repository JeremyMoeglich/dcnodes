<script lang="ts">
	import OutConnector from '$lib/out_connector.svelte';

	import type { data_refrence } from '$lib/types/item';

	export let data: data_refrence;
	let value: unknown;
</script>

<div class="box">
	<OutConnector {data} bind:value name="value" />
	<input type="text" bind:value />
</div>

<style>
	.box {
        display: flex;
        flex-direction: row-reverse;
		width: 100px;
		height: 70px;
		background-color: gray;
	}
</style>
