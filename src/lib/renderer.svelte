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
		vector,
		node_connections
	} from './types/item';
	import { typed_entries, map_values, map_entries, cover } from 'functional-utilities';
	import { SvelteComponent } from 'svelte';
	import { omit } from 'lodash-es';
	export let items: Record<node_identifier, Partial<item_type> & Pick<item_type, 'component'>>;
	const complete_items: Record<node_identifier, item_type> = map_values(items, (item) =>
		cover(
			{ component: SvelteComponent, node_connections: {}, position: { x: 0, y: 0 }, props: {} },
			item
		)
	);
	const datas: persistent_datas = map_entries(complete_items, ([k, item]) => [
		k,
		{
			id: k,
			item: item,
			svg_paths: {},
			drag_value: 0,
			connectors: {},
			values: {},
			on_change: () => {}
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

	function calculate_connection(start: connector_refrence, end: connector_refrence): string {
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
		const start: connector_refrence = datas[output.id].connectors[output.name];
		const end: connector_refrence =
			'x' in input
				? {
						get_direction: () => map_values(start.get_direction(), (v) => v * -1),
						get_location: () => input
				  }
				: datas[input.id].connectors[input.name];
		datas[output.id].svg_paths[output.name][JSON.stringify(input)] = calculate_connection(
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
		const connections = complete_items[id].node_connections ?? {};
		const connections_to_update = name
			? [[name, connections[name]] as [string, Set<connector_identifier<'end'>>]]
			: typed_entries(connections);
		//console.log(connections_to_update)
		if (type === 'end' || type === 'both') {
			connections_to_update.map(([k, connector]) => {
				back_connections[id][k].forEach((identifier) => {
					connector.forEach((out_identifier) => {
						update_single_connection(identifier, out_identifier);
					});
				});
			});
		}
		if (type === 'start' || type === 'both') {
			datas[id].svg_paths = {};
			connections_to_update.map(([k, connector]) => {
				datas[id].svg_paths[k] ??= {};
				connector.forEach((identifier) => {
					if (!('x' in identifier)) {
						((back_connections?.[identifier.id] ?? {})?.[identifier.name] ?? new Set()).add({
							id: id,
							name: k,
							type: 'out'
						});
					}
					update_single_connection({ id: id, name: k, type: 'out' }, identifier);
				});
			});
		}
		datas[id].on_change();
	}
	function add_connection(in_node: connector_identifier<'start'>, out_node: connector_identifier<'end'> | vector): void {
		datas[in_node.id].item.node_connections[in_node.name].add(out_node);
	}

	function refrence_item(i: node_identifier): item_type_refrence {
		const data = datas[i];
		return {
			get_component: () => data.item.component,
			get_node_connections: () => data.item.node_connections,
			get_position: () => data.item.position,
			get_props: () => data.item.props,
			set_component: (component: typeof SvelteComponent) => {
				data.item.component = component;
				update_connection(i);
			},
			set_position: (v: vector) => {
				data.item.position = v;
				update_connection(i);
			},
			set_node_connections: (connections: node_connections) => {
				data.item.node_connections = connections;
				update_connection(i, undefined, 'in');
			},
			add_node_connection: (name: string, to: connector_identifier<'in'> | vector) => {
				data.item.node_connections[name].add(to);
				update_connection(i, name, 'in');
			},
			remove_node_connection: (name: string, to?: connector_identifier<'in'> | vector) => {
				if (to) {
					data.item.node_connections[name].delete(to);
					update_connection(i, name, 'in');
				} else {
					delete data.item.node_connections[name];
					update_connection(i, name, 'in');
				}
			}
		};
	}

	const items_refrence: Record<
		node_identifier,
		item_type_refrence<Record<string, unknown>>
	> = map_entries(complete_items, ([i]) => [i, refrence_item(i)]);

	function get_container_position(): vector {
		return container === undefined
			? { x: 0, y: 0 }
			: omit(container.getBoundingClientRect(), ['height', 'width']);
	}

	function refrence_data(i: node_identifier): data_refrence {
		const data = datas[i];
		return {
			id: i,
			get_current_item_refrence: () => items_refrence[i],
			_get_drag_value: () => data.drag_value,
			_set_drag_value: (v: number) => {
				data.drag_value = v;
				data.on_change();
			},
			get_connectors: () => data.connectors,
			set_connector: (name: string, value: connector_refrence) => {
				data.connectors[name] = value;
				update_connection(i, name, 'in');
			},
			get_current_item: () => data.item,
			get_items: () => items_refrence,
			get_parent_info: () => ({
				position: get_container_position()
			}),
			get_svg_paths: () => data.svg_paths,
			set_current_item: (item: item_type) => {
				data.item = item;
				update_connection(i);
			},
			update_connections: (name?: string, type?: connector_types | 'both') => {
				update_connection(i, name, type);
			},
			set_on_change: (func: () => void) => {
				data.on_change = () => {
					func();
				};
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
			{@const i = data.id}
			{@const data_refrence = datas_refrence[i]}
			<div
				class="item"
				on:resize={() => {
					data_refrence.update_connections();
				}}
				use:draggable={{
					position: data.item.position,
					disabled: !(data.drag_value <= 0) === default_drag,
					onDrag: ({ offsetX, offsetY }) => {
						data_refrence.get_current_item_refrence().set_position({ x: offsetX, y: offsetY });
					}
				}}
			>
				<p>
					{data.id}
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
