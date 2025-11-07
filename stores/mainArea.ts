import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"
import { ref } from "vue"
import type { LatLng } from "leaflet"

export const useMainAreaStore = defineStore("mainArea", () => {
    const points = useStorage<LatLng[]>("flippermap_main_area", [])
    const isEditing = ref(false)
    const color = useStorage("flippermap_main_area_color", "#ffffff")

    const startEditing = () => {
        isEditing.value = true
    }

    const stopEditing = () => {
        isEditing.value = false
    }

    const toggleEditing = () => {
        isEditing.value = !isEditing.value
    }

    const addPoint = (point: LatLng) => {
        if (isEditing.value) {
            points.value.push(point)
        }
    }

    const removeLastPoint = () => {
        if (points.value.length > 0) {
            points.value.pop()
        }
    }

    const clearPoints = () => {
        points.value = []
    }

    const updateColor = (newColor: string) => {
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(newColor)) {
            color.value = newColor
        }
    }

    return {
        points,
        isEditing,
        color,
        startEditing,
        stopEditing,
        toggleEditing,
        addPoint,
        removeLastPoint,
        clearPoints,
        updateColor,
    }
})
