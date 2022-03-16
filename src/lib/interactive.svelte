<script lang="ts">
	import { onDestroy } from 'svelte';

	import type { data_refrence } from './types/item';

	export let data: data_refrence;
	export let invert = false;
	let previous_offset = 0;
	let current_offset = 0;
	let is_hovered = false;

	function update_offset(invert: boolean, is_hovered: boolean) {
		current_offset = invert === is_hovered ? 0 : 1;
		data._set_drag_value(data._get_drag_value() + current_offset - previous_offset);
		previous_offset = current_offset;
	}

	onDestroy(() => {
		is_hovered = false;
		update_offset(invert, is_hovered);
	});

	$: {
		update_offset(invert, is_hovered);
	}
</script>

<div
	on:mouseenter={() => {
		is_hovered = true;
	}}
	on:mouseleave={() => {
		is_hovered = false;
	}}
>
	<slot />
</div>
