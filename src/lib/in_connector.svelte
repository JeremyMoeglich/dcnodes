<script lang="ts">
	import { noop } from 'lodash-es';

	import Interactive from './interactive.svelte';
	import type {
		vector,
		connector_identifier,
		data_refrence,
		item_type_refrence
	} from './types/item';
	import { get_position, offset_position } from './utilities/rect_functions';

	export let data: data_refrence;
	export let allow_multiple_connections = false;
	export let value: unknown;
	export let name: string;
	export let direction: vector = { x: -1, y: 0 };
	export let on_value_change: () => void = noop;
	let start_connectors = new Set<connector_identifier<'start'>>();
	let dragged_start_connector: connector_identifier<'start'> | undefined;
	let last_drag_position: vector | undefined;

	let element: HTMLElement | undefined;

	function remove_previous_connection() {
		if (last_drag_position && dragged_start_connector) {
			data
				.get_items()
				[dragged_start_connector.id].remove_node_connection(
					dragged_start_connector.name,
					last_drag_position
				);
			last_drag_position = undefined;
		}
	}

	function take_connection(event: DragEvent) {
		if (start_connectors.size === 0) {
			return;
		}
		dragged_start_connector = start_connectors.values().next()
			.value as connector_identifier<'start'>;
		start_connectors.delete(dragged_start_connector);
		start_connectors = start_connectors;
		data
			.get_items()
			[dragged_start_connector.id].remove_node_connection(dragged_start_connector.name, self_data);
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', JSON.stringify(dragged_start_connector));
		} else {
			throw new Error('No dataTransfer');
		}
		during_drag(event);
	}

	function during_drag(event: DragEvent) {
		remove_previous_connection();
		if (dragged_start_connector === undefined) {
			throw new Error('dragged_start_connector is undefined');
		}

		if (event.clientX === 0 && event.clientY === 0) {
			return;
		}
		const drag_position = offset_position(
			{ x: event.pageX, y: event.pageY },
			data.get_parent_info().position
		);
		data
			.get_items()
			[dragged_start_connector.id].add_node_connection(dragged_start_connector.name, drag_position);
		last_drag_position = drag_position;
	}
	function drop(event: DragEvent) {
		const drop_data: connector_identifier<'start'> = JSON.parse(
			event.dataTransfer?.getData('text/plain') ?? '{ node_id: -1, name: "invalid" }'
		);
		if (drop_data.name === 'invalid') {
			console.log('invalid drop');
			return;
		}
		const drop_item_refrence: item_type_refrence = data.get_items()[drop_data.id];
		if (allow_multiple_connections) {
			drop_item_refrence.add_node_connection(drop_data.name, self_data);
			start_connectors.add(drop_data);
			start_connectors = start_connectors;
		} else {
			drop_item_refrence.add_node_connection(drop_data.name, self_data);
			start_connectors = new Set([drop_data]);
		}
	}

	data.set_connector(name, {
		get_location: () =>
			element ? get_position(element, data.get_parent_info().position) : { x: 0, y: 0 },
		get_direction: () => direction,
		set_value: (v) => {
			value = v;
			on_value_change();
		}
	});

	let self_data: connector_identifier<'end'>;
	$: self_data = { id: data.id, name: name, type: 'end' };
</script>

<Interactive bind:data>
	<div
		class="draggable"
		on:dragover|preventDefault
		on:dragstart={(event) => {
			take_connection(event);
		}}
		on:drag={(event) => {
			during_drag(event);
		}}
		on:dragend={(event) => {
			remove_previous_connection();
			dragged_start_connector = undefined;
		}}
		on:drop={drop}
		draggable={start_connectors.size > 0}
		bind:this={element}
	>
		<div class="main" />
	</div>
</Interactive>

<style>
	.main {
		width: 16px;
		height: 16px;
		border: 1px solid rgb(0, 0, 0);
		background-color: rgb(86, 103, 255);
	}
</style>
