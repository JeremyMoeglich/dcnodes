<script lang="ts">
	import { onDestroy } from 'svelte';

	import type { input_types } from './default_node/pass_value';
	import type { item_type, position } from './types/item';

	export let type: 'out' | 'in';
	export let item: item_type;
	export let value: input_types[keyof input_types];
	export let name: string;
	let dragged = false;
	let animation_id: number;
	let current_position: position = { x: 0, y: 0 };
	function animate() {
		animation_id = requestAnimationFrame(animate);
	}
	$: {
		if (dragged) {
			animation_id = requestAnimationFrame(animate);
		} else {
			cancelAnimationFrame(animation_id);
		}
	}
	onDestroy(() => cancelAnimationFrame(animation_id));
</script>

<div
	class="draggable"
	draggable={true}
	on:resize={() => {
		(item.update_fn ?? (() => {console.log('Resize detected, update function missing')}))(name);
	}}
	on:dragstart={() => {
		dragged = true;
	}}
	on:dragend={() => {
		dragged = false;
	}}
/>
<div class="main" style={type === 'in' ? 'color: blue;' : 'color: orange;'} />

<style>
	.main {
		width: 16px;
		height: 16px;
		border: 1px solid rgb(0, 0, 0);
	}
</style>
