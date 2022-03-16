<script lang="ts">
	import { draggable } from '@neodrag/svelte';
	import type {
		connector_identifier,
		connector_refrence,
		connector_types,
		datas_refrence,
		data_refrence,
		item_type,
		item_type_refrence,
		node_identifier,
		persistent_datas,
		readonly_connector_refrence,
		vector
	} from './types/item';
	import { typed_entries, map_values, map_entries, zip } from 'functional-utilities';
	import type { SvelteComponent } from 'svelte';
	import { omit } from 'lodash-es';
	export let items: Record<node_identifier, item_type>;
	const datas: persistent_datas = map_entries(items, ([k, item]) => [
		k,
		{
			index: k,
			item: item,
			svg_paths: {},
			drag_value: 0,
			connectors: {}
		}
	]);
	export let default_drag = true;
	let container: HTMLElement | undefined;

	function direction_to_offset(direction: vector, absolute_position: vector): vector {
		return {
			x: direction.x * 150 + absolute_position.x,
			y: direction.y * 150 + absolute_position.y
		};
	}

	function calculate_connection(
		start: readonly_connector_refrence,
		end: readonly_connector_refrence
	): string {
		const start_position = start.get_location();
		const start_offset = direction_to_offset(start.get_direction(), start_position);
		const end_position = end.get_location();
		const end_offset = direction_to_offset(end.get_direction(), end_position);
		return `M ${start_position.x} ${start_position.y} C ${start_offset.x} ${start_offset.y}, ${end_offset.x} ${end_offset.y}, ${end_position.x} ${end_position.y}`;
	}

	function update_single_connection(
		output: connector_identifier<'out'>,
		input: connector_identifier<'in'> | vector
	) {
		const start: connector_refrence = datas[output.index].connectors[output.name];
		const end: readonly_connector_refrence =
			'x' in input
				? {
						get_direction: () => map_values(start.get_direction(), (v) => v * -1),
						get_location: () => input
				  }
				: datas[input.index].connectors[input.name];
		datas[output.index].svg_paths[output.name][JSON.stringify(input)] = calculate_connection(
			start,
			end
		);
	}
	let back_connections: Record<node_identifier, Record<string, Set<connector_identifier<'out'>>>>;
	function update_connection(
		id: node_identifier,
		name?: string,
		type: connector_types | 'both' = 'both'
	) {
		const connections = items[id].node_connections ?? {};
		const connections_to_update = name
			? [[name, connections[name]] as [string, Set<connector_identifier<'in'>>]]
			: typed_entries(connections);
		//console.log(connections_to_update)
		if (type === 'in' || type === 'both') {
			connections_to_update.map(([k, connector]) => {
				back_connections[id][k].forEach((identifier) => {
					connector.forEach((out_identifier) => {
						update_single_connection(identifier, out_identifier);
					});
				});
			});
		}
		if (type === 'out' || type === 'both') {
			datas[id].svg_paths = {};
			connections_to_update.map(([k, connector]) => {
				datas[id].svg_paths[k] ??= {};
				connector.forEach((identifier) => {
					if (!('x' in identifier)) {
						((back_connections?.[identifier.index] ?? {})?.[identifier.name] ?? new Set()).add({
							index: id,
							name: k,
							type: 'out'
						});
					}
					update_single_connection({ index: id, name: k, type: 'out' }, identifier);
				});
			});
		}
	}

	function refrence_item(i: node_identifier): item_type_refrence {
		return {
			get_component: () => datas[i].item.component,
			get_node_connections: () => datas[i].item.node_connections,
			get_position: () => datas[i].item.position,
			get_props: () => datas[i].item.props,
			set_component: (component: typeof SvelteComponent) => {
				datas[i].item.component = component;
			},
			set_position: (v: vector) => {
				datas[i].item.position = v;
			}
		};
	}

	const items_refrence: Record<number, item_type_refrence<Record<string, unknown>>> = map_entries(
		items,
		([i]) => [i, refrence_item(i)]
	);

	function refrence_data(i: node_identifier): data_refrence {
		return {
			index: i,
			get_current_item_refrence: () => items_refrence[i],
			_get_drag_value: () => datas[i].drag_value,
			_set_drag_value: (v: number) => {
				datas[i].drag_value = v;
			},
			get_connectors: () => datas[i].connectors,
			get_current_item: () => datas[i].item,
			get_items: () => items_refrence,
			get_parent_info: () => ({
				position:
					container === undefined
						? { x: 0, y: 0 }
						: omit(container.getBoundingClientRect(), ['height', 'width'])
			}),
			get_svg_paths: () => datas[i].svg_paths,
			set_current_item: (item: item_type) => {
				datas[i].item = item;
			},
			update_connections: (name?: string, type?: connector_types | 'both') => {
				update_connection(i, name, type);
			}
		};
	}

	const datas_refrence: datas_refrence = map_entries(datas, ([i]) => [i, refrence_data(i)]);
</script>

<div class="main" bind:this={container}>
	<div class="connections">
		<svg width="100%" height="100%" stroke="#000" fill="#000" stroke-width={5}>
			{#each Object.values(datas) as data}
				{#each Object.values(data.svg_paths) as connector_paths}
					{#each Object.values(connector_paths) as path}
						<path d={path} fill="none" />
					{/each}
				{/each}
			{/each}
		</svg>
	</div>
	<div class="nodes">
		{#each Object.values(datas) as data}
			{@const i = data.index}
			{@const data_refrence = datas_refrence[i]}
			<div
				class="item"
				use:draggable={{
					position: data.item.position,
					disabled: !(data.drag_value <= 0) === default_drag,
					onDrag: ({ offsetX, offsetY }) => {
						data_refrence.get_current_item_refrence().set_position({ x: offsetX, y: offsetY });
					}
				}}
			>
				<p>
					{data.index}
					{data.drag_value}
					{JSON.stringify(data.item.node_connections)}
					{!(data.drag_value <= 0) === true}
				</p>
				<svelte:component
					this={data.item.component}
					{...data.item.props ?? {}}
					data={data_refrence}
				/>
			</div>
		{/each}
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
	p {
		margin: 0px;
		color: white;
	}
</style>
