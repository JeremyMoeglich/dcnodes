<script lang="ts">
	import Renderer from '$lib/renderer.svelte';
	import Add from '$lib/example_nodes/add.svelte';
	import Show from '$lib/example_nodes/show.svelte';
	import InputNode from '$lib/example_nodes/input_node.svelte';

	const items = {
		0: { component: Add, position: { x: 200, y: 300 } },
		1: { component: InputNode, position: { x: 0, y: 400 } },
		2: { component: InputNode, position: { x: 0, y: 400 } },
		3: { component: Show, position: { x: 300, y: 200 } }
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
