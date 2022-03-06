<script lang="ts">
	import { omit } from 'lodash-es';
	import { draggable } from '@neodrag/svelte';
	import type {
		item_type,
		vector,
		connector,
		passed_data,
		connector_identifier,
		connector_types,
		node_identifier
	} from './types/item';
	import { typed_entries, typed_from_entries } from './utilities/typed_entries';

	export let items: Record<number, item_type>;

	export let default_drag = true;

	function map_values<K extends PropertyKey, V, NV>(
		obj: Record<K, V>,
		func: (v: V) => NV
	): Record<K, NV> {
		return typed_from_entries(typed_entries(obj).map(([k, v]) => [k, func(v)]));
	}

	function map_entries<K extends PropertyKey, V, NK extends PropertyKey, NV>(
		obj: Record<K, V>,
		func: (entries: [K, V]) => [NK, NV]
	): Record<NK, NV> {
		return typed_from_entries(typed_entries(obj).map((entry) => func(entry)));
	}

	function direction_to_offset(direction: vector, absolute_position: vector): vector {
		return {
			x: direction.x * 150 + absolute_position.x,
			y: direction.y * 150 + absolute_position.y
		};
	}

	function calculate_connection(start: connector, end: connector): string {
		const start_position = start.locator();
		const start_offset = direction_to_offset(start.direction, start_position);
		const end_position = end.locator();
		const end_offset = direction_to_offset(end.direction, end_position);
		return `M ${start_position.x} ${start_position.y} C ${start_offset.x} ${start_offset.y}, ${end_offset.x} ${end_offset.y}, ${end_position.x} ${end_position.y}`;
	}

	function update_single_connection(
		output: connector_identifier<'out'>,
		input: connector_identifier<'in'>
	) {
		const start: connector = datas[output.index].internal.connectors[output.name];
		const end: connector = datas[input.index].internal.connectors[input.name];
		datas[output.index].internal.paths[output.name][JSON.stringify(input)] = calculate_connection(
			start,
			end
		);
	}
	let back_connections: Record<node_identifier, Record<string, Set<connector_identifier<'in'>>>>;
	function update_connection(
		id: node_identifier,
		name?: string,
		type: connector_types | 'both' = 'both'
	) {
		const connections = items[id].connections ?? {};
		const connections_to_update = name
			? [[name, connections[name]] as [string, Set<connector_identifier<'in'>>]]
			: typed_entries(connections);
		if (type === 'out' || type === 'both') {
			connections_to_update.map(([k, v]) => {
				back_connections[id][k].forEach((identifier) => {
					update_single_connection(v, identifier);
				});
			});
		}
		if (type === 'out' || type === 'both') {
			datas[id].internal.paths = {};
			connections_to_update.map(([k, connector]) => {
				datas[id].internal.paths[k] ??= {};
				Array.from(connector).map((identifier) => {
					update_single_connection({ index: id, name: k, type: 'out' }, identifier);
				});
			});
		}
	}

	let container: HTMLElement | undefined;
	let datas: Record<node_identifier, passed_data>;
	$: {
		const position: vector =
			container === undefined
				? { x: 0, y: 0 }
				: omit(container.getBoundingClientRect(), ['height', 'width']);
		map_values(items, (item) => {
			item.position ??= { x: 0, y: 0 };
			item.connections ??= {};
		});
		datas = map_entries(items, ([k, item]) => [
			k,
			{
				internal: {
					update_fn: (name?: string) => {
						update_connection(k, name);
					},
					id: k,
					drag_value:
						datas?.[k]?.internal?.drag_value ??
						(() => {
							console.log('overwrite', datas?.[k]?.internal?.drag_value);
							return 0;
						})(),
					connectors: datas?.[k]?.internal
						? datas?.[k]?.internal.connectors
						: ({} as Record<string, connector>),
					paths: datas?.[k].internal?.paths ?? {}
				},
				items: items,
				current_item: item,
				index: k,
				parent_info: { position: position }
			}
		]);
	}
</script>

<div class="main" bind:this={container}>
	<div class="connections">
		<svg width="100%" height="100%" stroke="#000" fill="#000" stroke-width={5}>
			{#each Object.values(datas) as data}
				{#each Object.values(data.internal.paths) as connector_paths}
					{#each Object.values(connector_paths) as path}
						<path d={path} fill="none" />
					{/each}
				{/each}
			{/each}
		</svg>
	</div>
	<div class="nodes">
		{#each Object.values(datas) as data}
			<div
				class="item"
				use:draggable={{
					position: data.current_item.position,
					disabled: !(data.internal.drag_value <= 0) === default_drag,
					onDrag: ({ offsetX, offsetY }) => {
						data.current_item.position = { x: offsetX, y: offsetY };
						data.internal.update_fn();
					}
				}}
			>
				<svelte:component
					this={data.current_item.component}
					{...data.current_item.props ?? {}}
					bind:data
				/>
			</div>
		{/each}
	</div>
	<div class="debug">
		<p>
			{map_entries(datas, ([k, v]) => [k, v.internal.drag_value])}
		</p>
	</div>
</div>

<style>
	.main {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.connections,
	.nodes {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0px;
		left: 0px;
	}
	.debug {
		position: absolute;
		color: white;
	}
	.item {
		position: absolute;
		top: 0px;
		left: 0px;
		width: fit-content;
		height: fit-content;
	}
</style>
