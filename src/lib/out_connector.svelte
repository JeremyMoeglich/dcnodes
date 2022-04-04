<script lang="ts">
	import { onDestroy } from 'svelte';

	import Interactive from './interactive.svelte';
	import type { vector, connector_identifier, data_refrence } from './types/item';

	export let data: data_refrence;
	export let value: unknown;
	export let name: string;
	export let direction: vector;
	let element: HTMLElement | undefined;

	function get_relative_to_renderer(position: vector): vector {
		const parent_position: vector = data.get_parent_info().position;
		return { x: position.x - parent_position.x, y: position.y - parent_position.y };
	}

	function remove_previous_connection() {
		if (last_drag_position) {
			data.get_current_item_refrence().remove_node_connection(name, last_drag_position);
		}
	}

	function get_position(): vector {
		if (element === undefined) {
			return { x: 0, y: 0 };
		}
		const rect = element.getBoundingClientRect();
		return get_relative_to_renderer(rect);
	}
	function during_drag(event: DragEvent) {
		remove_previous_connection();
		const drag_position = get_relative_to_renderer({ x: event.pageX, y: event.pageY });
		data.get_current_item_refrence().add_node_connection(name, drag_position);
		last_drag_position = drag_position;
	}

	function dragstart(event: DragEvent) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', JSON.stringify(self_data));
		}
	}

	data.set_connector(name, { get_location: get_position, get_direction: () => direction });
	let self_data: connector_identifier;
	let last_drag_position: vector;
	$: self_data = { id: data.id, name: name, type: 'start' };

	function send_value(value: unknown) {
		data
			.get_current_item_refrence()
			.get_node_connections()
			?.[name]?.forEach?.((v) => {
				if ('x' in v) {
					return;
				}
				data._send_value(value, v);
			});
	}

	$: send_value(value);

	onDestroy(() => {
		remove_previous_connection();
	});
</script>

<Interactive bind:data>
	<div
		class="draggable"
		on:drag={during_drag}
		draggable={true}
		bind:this={element}
		on:dragstart={dragstart}
		on:dragend={remove_previous_connection}
	>
		<div class="main" />
	</div>
</Interactive>

<style>
	.main {
		width: 16px;
		height: 16px;
		border: 1px solid rgb(0, 0, 0);
		background-color: rgb(255, 202, 88);
	}
</style>
