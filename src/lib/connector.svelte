<script lang="ts">
	import { getContext, onDestroy } from 'svelte';

	import type { input_types } from './default_node/pass_value';
	import type { internal_item_type, position } from './types/item';

	export let type: 'out' | 'in';
	export let item: internal_item_type;
	export let value: input_types[keyof input_types];
	export let name: string;
	let dragged = false;
	let animation_id: number;
	let element: HTMLElement;

	function locator(): position {
		const parent_position: position = getContext('sveltedc-position');
		const rect = element.getBoundingClientRect();
		const new_position: position = { x: rect.x - parent_position.x, y: rect.y - parent_position.y };
		return new_position;
	}
	item.locators[name] = locator;
	function drop(event: MouseEvent) {
		if (type === 'in') {
			item.update_fn(name)
		}
	}
	function animate() {
		animation_id = requestAnimationFrame(animate);
		item.update_fn(name);
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
	on:drop={drop}
	draggable={type === 'out'}
	bind:this={element}
	on:dragstart={(event) => {
		event.dataTransfer?.setData('text/plain', JSON.stringify({ id: item.id, name: name }));
		dragged = true;
	}}
	on:dragend={() => {
		dragged = false;
	}}
>
	<div class="main" style={type === 'in' ? 'color: blue;' : 'color: orange;'} />
</div>

<style>
	.main {
		width: 16px;
		height: 16px;
		border: 1px solid rgb(0, 0, 0);
	}
</style>
