<script lang="ts">
	import { omit } from 'lodash-es';

	import { setContext } from 'svelte';
	import tsObjectEntries from 'ts-type-object-entries';

	import type { item_type, internal_item_type, vector, connector } from './types/item';

	export let items: Array<item_type>;

	let paths: Record<string, string>[] = items.map(() => ({}));

	function direction_to_offset(direction: vector): vector {
		return direction;
	}

	function calculate_connection(start: connector, end: connector): string {
		const start_position = start.locator();
		const start_offset = direction_to_offset(start.direction);
		const end_offset = direction_to_offset(end.direction);
		const end_position = end.locator();
		return `M ${start_position.x} ${start_position.y} C ${start_offset.x} ${start_offset.y}, ${end_offset.x} ${end_offset.y}, ${end_position.x} ${end_position.y}`;
	}

	function update_connection(id: number) {
		let connections = internal_items[id].connections;
		if (connections === undefined) {
			connections = {};
		}
		paths[id] = {};
		tsObjectEntries(connections).map(([k, v]) => {
			const start = internal_items[id].connectors[k];
			const end: connector = internal_items[v.node_id].connectors[v.name];
			paths[id][k] = calculate_connection(start, end);
		});
	}

	export let internal_items: Array<internal_item_type> = items.map((item, i) => ({
		...item,
		...{
			update_fn: () => {
				update_connection(i);
			},
			id: i,
			connectors: {} as Record<string, { locator: () => vector; direction: vector }>
		}
	}));
	$: items.map((item) => {
		item.position = item.position ?? { x: 0, y: 0 };
	});
	let container: HTMLElement | undefined;
	$: {
		const position: vector =
			container === undefined
				? { x: 0, y: 0 }
				: omit(container.getBoundingClientRect(), ['height', 'width']);
		setContext('sveltedc_position', position);
		setContext('sveltedc_items', internal_items);
	}
	$: {
		console.clear();
		console.log(internal_items);
	}
</script>

<div class="main" bind:this={container}>
	<div class="nodes">
		{#each internal_items as item}
			<div class="item" style={`transform: translate(${item.position?.x ?? 0}px, ${item.position?.y ?? 0}px);`}>
				<svelte:component this={item.component} {...item.props ?? {}} bind:item />
			</div>
		{/each}
	</div>
	<div class="connections">
		<svg>
			{#each paths as node_paths}
				{#each Object.values(node_paths) as path}
					<path d={path} />
				{/each}
			{/each}
		</svg>
	</div>
</div>

<style>
	.main {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.item {
		position: absolute;
		top: 0px;
		left: 0px;
		width: fit-content;
		height: fit-content;
	}
</style>
