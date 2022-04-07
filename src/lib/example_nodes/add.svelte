<script lang="ts">
	import DefaultNode from '$lib/default_node/default_node.svelte';
	import type { data_refrence } from '$lib/types/item';

	function unknown_to_number(v: unknown): number | undefined {
		if (typeof v === 'number') {
			return v;
		}
		if (typeof v === 'string') {
			return parseFloat(v);
		}
		return undefined;
	}

	const inputs = ['value_1', 'value_2'] as const;
	const outputs = ['result'] as const;
	const fn = (given: Record<typeof inputs[number], unknown>) => {
		const v1 = unknown_to_number(given.value_1);
		const v2 = unknown_to_number(given.value_2);

		if (typeof v1 === 'undefined' || typeof v2 === 'undefined') {
			return { result: undefined };
		}

		return {
			result: v1 + v2
		};
	};

	export let data: data_refrence;
</script>

<DefaultNode {inputs} {outputs} {fn} {data} />;
