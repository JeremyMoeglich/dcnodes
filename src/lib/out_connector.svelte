<script lang="ts">
	import { onDestroy } from 'svelte';

	import Interactive from './interactive.svelte';
	import type { vector, connector_identifier, data_refrence } from './types/item';
	import { get_position, offset_position } from './utilities/rect_functions';

	export let data: data_refrence;
	export let value: unknown;
	export let name: string;
	export let direction: vector = { x: 1, y: 0 };
	let element: HTMLElement | undefined;

	function remove_previous_connection() {
		if (last_drag_position) {
			data.get_current_item_refrence().remove_node_connection(name, last_drag_position);
			last_drag_position = undefined;
		}
	}

	function during_drag(event: DragEvent) {
		remove_previous_connection();
		const drag_position = offset_position(
			{ x: event.pageX, y: event.pageY },
			data.get_parent_info().position
		);
		if (event.clientX === 0 && event.clientY === 0) {
			return;
		}

		data.get_current_item_refrence().add_node_connection(name, drag_position);
		last_drag_position = drag_position;
	}

	function dragstart(event: DragEvent) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', JSON.stringify(self_data));
		}
	}

	data.set_connector(name, {
		get_location: () =>
			element ? get_position(element, data.get_parent_info().position) : { x: 0, y: 0 },
		get_direction: () => direction
	});
	let self_data: connector_identifier;
	let last_drag_position: vector | undefined;
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
