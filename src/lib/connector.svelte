<script lang="ts">
	import { browser } from '$app/env';
	import { onDestroy } from 'svelte';

	import type { input_types } from './default_node/pass_value';
	import type { vector, connector_identifier, passed_data, connector_types } from './types/item';

	export let type: connector_types;
	export let data: passed_data;
	export let value: input_types[keyof input_types];
	export let name: string;
	export let direction: vector;
	let animation_id: number;
	let element: HTMLElement | undefined;

	function get_relative_to_renderer(position: vector): vector {
		const parent_position: vector = data.parent_info.position;
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
			const drop_data: connector_identifier = JSON.parse(
				event.dataTransfer?.getData('text/plain') ?? '{ node_id: -1, name: "invalid" }'
			);
			const connections = data.items[drop_data.index].connections;
			if (connections === undefined) {
				throw 'connections is undefined';
			} else {
				connections[drop_data.name].add(self_data);
			}
			data.items[drop_data.index].connections = connections;
		}
	}
	function dragstart(event: DragEvent) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', JSON.stringify(self_data));
		}

		start();
	}
	function animate() {
		data.internal.update_fn();
		start();
	}
	function cancel() {
		if (browser && animation_id) {
			cancelAnimationFrame(animation_id);
		}
	}
	function start() {
		animation_id = requestAnimationFrame(animate);
	}

	data.internal.connectors[name] = { locator: locator, direction: direction };
	onDestroy(cancel);
	let self_data: connector_identifier;
	$: self_data = { index: data.index, name: name, type: type };
</script>

<div
	class="draggable"
	on:dragover={(event) => {
		if (type === 'in') {
			event.preventDefault();
		}
	}}
	on:drop={drop}
	draggable={type === 'out'}
	bind:this={element}
	on:dragstart={dragstart}
	on:dragend={() => {
		cancel();
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
