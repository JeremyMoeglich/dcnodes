<script lang="ts">
	import { browser } from '$app/env';

	import { getContext, onDestroy } from 'svelte';

	import type { input_types } from './default_node/pass_value';
	import type { internal_item_type, vector, connector_identifier } from './types/item';

	export let type: 'out' | 'in';
	export let item: internal_item_type;
	export let value: input_types[keyof input_types];
	export let name: string;
	export let direction: vector;
	let dragged = false;
	let animation_id: number;
	let element: HTMLElement | undefined;

	function get_relative_to_renderer(position: vector): vector {
		const parent_position: vector = getContext('sveltedc-position');
		return { x: position.x - parent_position.x, y: position.y - parent_position.y };
	}

	function locator(): vector {
		if (element === undefined) {
			return { x: 0, y: 0 };
		}
		const rect = element.getBoundingClientRect();
		return get_relative_to_renderer(rect);
	}

	function drop(event: DragEvent) {
		if (type === 'in') {
			const data: connector_identifier = JSON.parse(
				event.dataTransfer?.getData('text/plain') ?? '{ node_id: -1, name: "invalid" }'
			);
			((getContext('sveltedc_items') as Array<internal_item_type>)[data.node_id].connections ?? {})[
				data.name
			] = self_data;
		}
	}
	function animate() {
		animation_id = requestAnimationFrame(animate);
		((getContext('sveltedc_items') as Array<internal_item_type>)[self_data.node_id].connections ??
			{})[self_data.name] = self_data;
	}
	$: {
		if (dragged) {
			animation_id = requestAnimationFrame(animate);
		} else {
			if (browser) {
				cancelAnimationFrame(animation_id);
			}
		}
	}
	item.connectors[name] = { locator: locator, direction: direction };
	onDestroy(() => {
		if (browser) {
			cancelAnimationFrame(animation_id);
		}
	});
	const self_data: connector_identifier = { node_id: item.id, name: name };
</script>

<div
	class="draggable"
	on:dragover={(event) => {
		if (type === 'in') {
			event.preventDefault();
		}
	}}
	on:drop={(event) => drop(event)}
	draggable={type === 'out'}
	bind:this={element}
	on:dragstart={(event) => {
		event.dataTransfer?.setData('text/plain', JSON.stringify(self_data));
		dragged = true;
	}}
	on:dragend={() => {
		dragged = false;
		item.update_fn();
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
