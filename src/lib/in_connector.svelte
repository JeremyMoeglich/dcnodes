<script lang="ts">
	import type { input_types } from './default_node/pass_value';
	import Interactive from './interactive.svelte';
	import type { vector, connector_identifier, passed_data, connector_types } from './types/item';

	export let data: passed_data;
	export let value: input_types[keyof input_types];
	export let name: string;
	export let direction: vector;
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
	function set_add<T>(set: Set<T> | undefined, v: T): Set<T> {
		set ??= new Set();
		set.add(v);
		return set;
	}

	function drop(event: DragEvent) {
		const drop_data: connector_identifier<'out'> = JSON.parse(
			event.dataTransfer?.getData('text/plain') ?? '{ node_id: -1, name: "invalid" }'
		);
		const connections = data.items[drop_data.index].connections;
		if (connections === undefined) {
			throw 'connections is undefined';
		} else {
			connections[drop_data.name] = set_add(connections[drop_data.name], self_data);
		}
		data.items[drop_data.index].connections = connections;
		data.internal.update_fn();
	}

	data.internal.connectors[name] = { locator: locator, direction: direction };
	let self_data: connector_identifier<'in'>;
	$: self_data = { index: data.index, name: name, type: 'in' };
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
