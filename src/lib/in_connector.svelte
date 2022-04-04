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
	export let value: unknown;
	export let name: string;
	export let direction: vector;
	export let on_value_change: () => void = noop;
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

	function drop(event: DragEvent) {
		const drop_data: connector_identifier<'start'> = JSON.parse(
			event.dataTransfer?.getData('text/plain') ?? '{ node_id: -1, name: "invalid" }'
		);
		if (drop_data.name === 'invalid') {
			console.log('invalid drop');
			return;
		}
		const drop_item_refrence: item_type_refrence = data.get_items()[drop_data.id];
		drop_item_refrence.add_node_connection(drop_data.name, self_data);
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
		on:drop={drop}
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
