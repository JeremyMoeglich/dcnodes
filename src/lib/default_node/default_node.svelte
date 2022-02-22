<script lang="ts">
	import Connector from '../connector.svelte';
	import type { io_type } from './pass_value';

	export let inputs: io_type;
	export let outputs: io_type;

	type object_key = string | symbol | number;

	export function typed_entries<K extends object_key, V>(
		obj: Partial<Record<K, V>>
	): Array<[K, V]> {
		return Object.entries(obj) as Array<[K, V]>;
	}
</script>

{#each typed_entries(inputs) as [name, value]}
	<Connector type='in' value={value.value}/>
	<p>{name}</p>
{/each}

{#each typed_entries(outputs) as [name, value]}
	<Connector type='out' value={value.value}/>
	<p>{name}</p>
{/each}
