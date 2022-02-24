<script lang="ts">
	import Renderer from '$lib/renderer.svelte';
	import DefaultNode from '$lib/default_node.svelte';
	import type { item_type } from '$lib/types/item';
	import type { io_type } from '$lib/default_node/pass_value';

	const test_io: { inputs: io_type; outputs: io_type } = { inputs: {
		'test1': {type: 'number', 'value': 50},
		'x': {type: 'string', 'value': "test?"}
	}, outputs: {
		'out1': {type: 'number', 'value': 0},
		'y': {type: 'string', 'value': ""}
	} };

	const items: item_type<{ inputs: io_type; outputs: io_type }>[] = [
		{ component: DefaultNode, props: test_io },
		{ component: DefaultNode, position: { x: 200, y: 100 }, props: test_io },
		{ component: DefaultNode, position: { x: 300, y: 200 }, props: test_io }
	];
</script>

<div class="all">
	<Renderer {items} />
</div>

<style>
	.all {
		width: 100vw;
		height: 100vw;
	}
</style>
