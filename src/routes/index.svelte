<script lang="ts">
	import Renderer from '$lib/renderer.svelte';
	import DefaultNode from '$lib/default_node.svelte';
	import type { io_type } from '$lib/default_node/pass_value';

	const test_io: { inputs: io_type; outputs: io_type } = {
		inputs: {
			test1: { type: 'number', value: 50 },
			x: { type: 'string', value: 'test?' }
		},
		outputs: {
			out1: { type: 'number', value: 0 },
			y: { type: 'string', value: '' }
		}
	};

	const items = {
		0: { component: DefaultNode, props: test_io, position: { x: 200, y: 300 } },
		1: { component: DefaultNode, position: { x: 0, y: 400 }, props: test_io },
		2: { component: DefaultNode, position: { x: 300, y: 200 }, props: test_io }
	};
</script>

<div class="all">
	<Renderer {items} />
</div>

<style>
	.all {
		width: 100%;
		height: 100%;
	}
	:global(body) {
		margin: 0px;
		background-color: rgb(27, 27, 27);
	}
</style>
