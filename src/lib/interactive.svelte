<script lang="ts">
	import { onDestroy } from 'svelte';

	import type { passed_data } from './types/item';

	export let data: passed_data;
	export let invert = false;
	let is_hovered = false;

	function enter() {
		if (invert) {
			data.internal.drag_value -= 1;
		} else {
			data.internal.drag_value += 1;
		}

		is_hovered = true;
	}

	function leave() {
		if (invert) {
			data.internal.drag_value += 1;
		} else {
			data.internal.drag_value -= 1;
		}

		is_hovered = false;
	}

	onDestroy(leave);
</script>

<div on:mouseenter={enter} on:mouseleave={leave}>
	<slot />
</div>
