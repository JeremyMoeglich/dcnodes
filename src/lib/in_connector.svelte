<script lang="ts">
	import { noop } from 'lodash-es';

	import Interactive from './interactive.svelte';
	import type {
		vector,
		connector_identifier,
		data_refrence,
		item_type_refrence
	} from './types/item';

	export let data: data_refrence;
	export let allow_multiple_connections = false;
	export let value: unknown;
	export let name: string;
	export let direction: vector;
	export let on_value_change: () => void = noop;
	let start_connectors = new Set<connector_identifier<'start'>>();
	let dragged_start_connector: connector_identifier<'start'> | undefined;
	let last_drag_position: vector | undefined;

	let element: HTMLElement | undefined;

	function get_relative_to_renderer(position: vector): vector {
		const parent_position: vector = data.get_parent_info().position;
		return { x: position.x - parent_position.x, y: position.y - parent_position.y };
	}

	function get_position(): vector {
		if (element === undefined) {
			return { x: 0, y: 0 };
		}
		const rect = element.getBoundingClientRect();
		return get_relative_to_renderer(rect);
	}

	function remove_previous_connection() {
		if (last_drag_position) {
			data.get_current_item_refrence().remove_node_connection(name, last_drag_position);
		}
	}

	function take_connection(event: DragEvent) {
		if (start_connectors.size === 0) {
			return;
		}
		dragged_start_connector = start_connectors.values().next()
			.value as connector_identifier<'start'>;
		start_connectors.delete(dragged_start_connector);
		data
			.get_items()
			[dragged_start_connector.id].get_node_connections()
			[dragged_start_connector.name].delete(self_data);
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', JSON.stringify(dragged_start_connector));
		}
		during_drag(event);
	}

	function during_drag(event: DragEvent) {
		remove_previous_connection();
		if (dragged_start_connector === undefined) {
			return;
		}
		const drag_position = get_relative_to_renderer({ x: event.pageX, y: event.pageY });
		data.get_current_item_refrence().add_node_connection(name, drag_position);
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
			drop_item_refrence.set_node_connections({ [drop_data.name]: new Set([self_data]) });
			start_connectors = new Set([drop_data]);
		}
	}

	data.set_connector(name, {
		get_location: get_position,
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
		on:dragover={(event) => {
			event.preventDefault();
		}}
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
