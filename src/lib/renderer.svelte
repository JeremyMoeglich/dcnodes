<script lang="ts">
	import { omit } from 'lodash-es';
	import { draggable } from '@neodrag/svelte';
	import type {
		item_type,
		vector,
		connector,
		passed_data,
		connector_identifier,
		connector_types
	} from './types/item';
import { typed_entries, typed_from_entries } from './utilities/typed_entries';

	export let items: Record<number, item_type>;

	export let default_drag = true;

	function map_values<K extends PropertyKey, T extends Record<K, V>, V, NV>(
		obj: T,
		func: (v: V) => NV
	): Record<K, NV> {
		const r = typed_from_entries(typed_entries(obj));
		return r;
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

	function update_connection(id: number, name?: string, type: connector_types | 'both' = 'both') {
		const connections = items[id].connections ?? {};
		const connections_to_update = name
			? [[name, connections[name]] as [string, Set<connector_identifier<'in'>>]]
			: typed_entries(connections);

		datas[id].internal.paths = {};
		connections_to_update.map(([k, connector]) => {
			datas[id].internal.paths[k] ??= {};
			Array.from(connector).map((v) => {
				const start = datas[id].internal.connectors[k];
				const end: connector = datas[v.index].internal.connectors[v.name];
				datas[id].internal.paths[k][JSON.stringify(v)] = calculate_connection(start, end);
			});
		});
	}

	let container: HTMLElement | undefined;
	let datas: passed_data[];
	$: {
		const position: vector =
			container === undefined
				? { x: 0, y: 0 }
				: omit(container.getBoundingClientRect(), ['height', 'width']);
		items.map((item) => {
			item.position ??= { x: 0, y: 0 };
			item.connections ??= {};
		});
		datas = items.map((item, i) => ({
			internal: {
				update_fn: (name?: string) => {
					update_connection(i, name);
				},
				id: i,
				drag_value:
					datas?.[i]?.internal?.drag_value ??
					(() => {
						console.log('overwrite', datas?.[i]?.internal?.drag_value);
						return 0;
					})(),
				connectors: datas?.[i]?.internal
					? datas?.[i]?.internal.connectors
					: ({} as Record<string, { locator: () => vector; direction: vector }>)
			},
			items: items,
			current_item: item,
			index: i,
			parent_info: { position: position }
		}));
	}
</script>

<div class="main" bind:this={container}>
	<div class="connections">
		<svg width="100%" height="100%" stroke="#000" fill="#000" stroke-width={5}>
			{#each paths as node_paths}
				{#each Object.values(node_paths) as paths}
					{#each Object.values(paths) as path}
						<path d={path} fill="none" />
					{/each}
				{/each}
			{/each}
		</svg>
	</div>
	<div class="nodes">
		{#each datas as data, i}
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
			{datas.map((obj) => obj.internal.drag_value)}
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
