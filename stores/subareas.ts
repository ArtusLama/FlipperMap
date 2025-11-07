import { defineStore } from "pinia"
import { useStorage } from "@vueuse/core"
import { ref } from "vue"
import type { LatLng } from "leaflet"

interface SubArea {
    id: string
    name: string
    color: string
    vertices: LatLng[]
    isEditing: boolean
}

export const useSubAreasStore = defineStore("subareas", () => {
    const areas = useStorage<SubArea[]>("flippermap_subareas", [])
    const mousePosition = ref<LatLng | null>(null)
    const editingAreaId = ref<string | null>(null)

    const addArea = (name: string, color: string = "#3B82F6") => {
        const newArea: SubArea = {
            id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            color,
            vertices: [],
            isEditing: false,
        }
        areas.value.push(newArea)
        return newArea.id
    }

    const removeArea = (id: string) => {
        const index = areas.value.findIndex(a => a.id === id)
        if (index !== -1) {
            areas.value.splice(index, 1)
        }
    }

    const updateArea = (id: string, updates: Partial<Omit<SubArea, "id">>) => {
        const area = areas.value.find(a => a.id === id)
        if (area) {
            Object.assign(area, updates)
        }
    }

    const startEditing = (id: string) => {
        // Stop editing any other areas first
        areas.value.forEach((area) => {
            area.isEditing = area.id === id
        })
        editingAreaId.value = id
    }

    const stopEditing = () => {
        areas.value.forEach((area) => {
            area.isEditing = false
        })
        editingAreaId.value = null
    }

    const addPoint = (areaId: string, point: LatLng) => {
        const area = areas.value.find(a => a.id === areaId)
        if (area && area.isEditing) {
            area.vertices.push(point)
        }
    }

    const removeLastPoint = (areaId: string) => {
        const area = areas.value.find(a => a.id === areaId)
        if (area && area.vertices.length > 0) {
            area.vertices.pop()
        }
    }

    const clearPoints = (areaId: string) => {
        const area = areas.value.find(a => a.id === areaId)
        if (area) {
            area.vertices = []
        }
    }

    const updateMousePosition = (point: LatLng) => {
        mousePosition.value = point
    }

    return {
        areas,
        mousePosition,
        editingAreaId,
        addArea,
        removeArea,
        updateArea,
        startEditing,
        stopEditing,
        addPoint,
        removeLastPoint,
        clearPoints,
        updateMousePosition,
    }
})
