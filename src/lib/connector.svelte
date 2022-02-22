<script lang="ts">
	import type { input_types } from './default_node/pass_value';

	export let type: 'out' | 'in';
	export let value: input_types[keyof input_types];
</script>

<div class="main" style={type === 'in' ? 'color: blue;' : 'color: orange;'} />

<style>
	.main {
		width: 16px;
		height: 16px;
		border: 1px solid rgb(0, 0, 0);
	}
</style>
