<script lang="ts">
	import type { input_types } from './default_node/pass_value';
	import Interactive from './interactive.svelte';
	import type { vector, connector_identifier, passed_data } from './types/item';

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
	function during_drag(event: DragEvent) {
		if (last_drag_position) {
			data?.current_item?.connections?.[name]?.delete?.(last_drag_position);
		}
		data?.current_item?.connections?.[name]?.add?.(
			get_relative_to_renderer({ x: event.pageX, y: event.pageY })
		);
		data.internal.update_fn(name, 'out');
	}

	function dragstart(event: DragEvent) {
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', JSON.stringify(self_data));
		}
	}

	$: data.internal.connectors[name] = { locator: locator, direction: direction };
	let self_data: connector_identifier;
	let last_drag_position: vector;
	$: self_data = { index: data.index, name: name, type: 'out' };
</script>

<Interactive bind:data>
	<div
		class="draggable"
		on:drag={during_drag}
		draggable={true}
		bind:this={element}
		on:dragstart={dragstart}
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
