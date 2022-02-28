<script lang="ts">
	import { omit } from 'lodash-es';
	import { draggable } from '@neodrag/svelte';
	import tsObjectEntries from 'ts-type-object-entries';

	import type {
		item_type,
		vector,
		connector,
		passed_data,
		internal_data,
		connector_identifier
	} from './types/item';

	export let items: Array<item_type>;

	let paths: Record<string, Record<string, string>>[] = items.map(() => ({}));

	export let default_drag = true;

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

	function update_connection(id: number) {
		let connections = items[id].connections;
		if (connections === undefined) {
			connections = {};
		}
		paths[id] = {};
		tsObjectEntries(connections).map(([k, connector]) => {
			paths[id][k] ??= {};
			Array.from(connector).map((v) => {
				const start = internals[id].connectors[k];
				const end: connector = internals[v.index].connectors[v.name];
				paths[id][k][JSON.stringify(v as connector_identifier)] = calculate_connection(start, end);
			});
		});
	}

	let internals: internal_data[];
	$: internals = items.map((v, i) => ({
		update_fn: () => {
			update_connection(i);
		},
		id: i,
		drag_value: internals?.[i]?.drag_value ?? 0,
		connectors: internals?.[i]
			? internals[i].connectors
			: ({} as Record<string, { locator: () => vector; direction: vector }>)
	}));
	$: items.map((item) => {
		item.position ??= { x: 0, y: 0 };
		item.connections ??= {};
	});
	let container: HTMLElement | undefined;
	let datas: passed_data[];
	$: {
		const position: vector =
			container === undefined
				? { x: 0, y: 0 }
				: omit(container.getBoundingClientRect(), ['height', 'width']);
		datas = items.map((item, i) => ({
			internal: internals[i],
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
					disabled: !(data.internal.drag_value <= 0) === default_drag
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
