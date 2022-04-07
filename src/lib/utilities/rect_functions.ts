import type { vector } from "$lib/types/item";

export function offset_position(position: vector, position2: vector): vector {
    return { x: position.x - position2.x, y: position.y - position2.y };
}

export function get_center_bounding_rect(bounding_rect: DOMRect): vector {
    return {
        x: bounding_rect.left + bounding_rect.width / 2,
        y: bounding_rect.top + bounding_rect.height / 2
    };
}

export function get_position(element: HTMLElement, parent: vector): vector {
    if (element === undefined) {
        return { x: 0, y: 0 };
    }
    const rect = element.getBoundingClientRect();
    return offset_position(get_center_bounding_rect(rect), parent);
}