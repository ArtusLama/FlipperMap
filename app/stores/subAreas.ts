import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { LatLng } from "leaflet"
import { useStorage } from "@vueuse/core"

export interface SubArea {
    id: string
    name: string
    color: string
    points: LatLng[]
    isEditing: boolean
}

const STORAGE_KEY = "flippermap_subareas"

interface SerializedPoint {
    lat: number
    lng: number
}

interface SerializedSubArea extends Omit<SubArea, 'points'> {
    points: SerializedPoint[]
}

function serializeLatLng(point: LatLng): SerializedPoint {
    return { lat: point.lat, lng: point.lng }
}

function deserializeLatLng(point: SerializedPoint): LatLng {
    return new LatLng(point.lat, point.lng)
}

function serializeArea(area: SubArea): SerializedSubArea {
    return {
        ...area,
        points: area.points.map(p => serializeLatLng(p))
    }
}

function deserializeArea(area: SerializedSubArea): SubArea {
    return {
        ...area,
        points: area.points.map(p => deserializeLatLng(p))
    }
}

export const useSubAreasStore = defineStore("sub-areas", () => {
    // State - use ref for runtime values that shouldn't be persisted
    const lastUpdated = ref(Date.now())
    const mousePosition = ref<LatLng | null>(null)

    // Persistent state with serialization
    const serializedAreas = useStorage<SerializedSubArea[]>(STORAGE_KEY, [])
    
    // Computed property to handle serialization/deserialization
    const areas = computed({
        get: () => serializedAreas.value.map(deserializeArea),
        set: (newAreas: SubArea[]) => {
            serializedAreas.value = newAreas.map(serializeArea)
        }
    })

    // Getters
    const getAreaById = computed(() => (id: string) =>
        areas.value.find(area => area.id === id)
    )

    const getPreviewPoints = computed(() => (areaId: string) => {
        const area = areas.value.find(area => area.id === areaId)
        if (!area || !area.isEditing || !mousePosition.value || area.points.length === 0) {
            return area?.points || []
        }

        // Return points including the current mouse position and closing back to first point
        const previewPoints = [...area.points]
        if (mousePosition.value) {
            previewPoints.push(mousePosition.value)
        }
        if (previewPoints.length >= 3 && area.points[0]) {
            previewPoints.push(area.points[0]) // Close the polygon
        }
        return previewPoints
    })

    // Actions
    function createArea(name: string, color: string = "#3B82F6") {
        const newArea: SubArea = {
            id: `area_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            color,
            points: [],
            isEditing: false,
        }
        areas.value = [...areas.value, newArea]
        return newArea
    }

    function deleteArea(id: string) {
        areas.value = areas.value.filter(area => area.id !== id)
        lastUpdated.value = Date.now()
    }

    function updateArea(id: string, updates: Partial<Omit<SubArea, "id">>) {
        areas.value = areas.value.map(area => 
            area.id === id ? { ...area, ...updates } : area
        )
        lastUpdated.value = Date.now()
    }

    function addPoint(areaId: string, point: LatLng) {
        areas.value = areas.value.map(area => {
            if (area.id === areaId) {
                return {
                    ...area,
                    points: [...area.points, point]
                }
            }
            return area
        })
        lastUpdated.value = Date.now()
    }

    function removePoint(areaId: string, index: number) {
        areas.value = areas.value.map(area => {
            if (area.id === areaId) {
                const newPoints = [...area.points]
                newPoints.splice(index, 1)
                return {
                    ...area,
                    points: newPoints
                }
            }
            return area
        })
        lastUpdated.value = Date.now()
    }

    function startEditing(id: string) {
        areas.value = areas.value.map(area => ({
            ...area,
            isEditing: area.id === id
        }))
        lastUpdated.value = Date.now()
    }

    function stopEditing(id: string) {
        areas.value = areas.value.map(area => {
            if (area.id === id) {
                return { ...area, isEditing: false }
            }
            return area
        })
        lastUpdated.value = Date.now()
    }

    function stopEditingAll() {
        areas.value = areas.value.map(area => ({
            ...area,
            isEditing: false
        }))
        lastUpdated.value = Date.now()
    }

    function updateAreaColor(id: string, color: string) {
        areas.value = areas.value.map(area => {
            if (area.id === id) {
                return { ...area, color }
            }
            return area
        })
        lastUpdated.value = Date.now()
    }

    function startNewArea(color: string) {
        const areaName = `Area ${areas.value.length + 1}`
        const newArea = createArea(areaName, color)
        startEditing(newArea.id)
        return newArea
    }

    function updateMousePosition(position: LatLng | null) {
        mousePosition.value = position
    }

    return {
        // State
        areas,
        lastUpdated,

        // Getters
        getAreaById,
        getPreviewPoints,

        // Actions
        createArea,
        deleteArea,
        updateArea,
        addPoint,
        removePoint,
        startEditing,
        stopEditing,
        stopEditingAll,
        updateAreaColor,
        startNewArea,
        updateMousePosition,
    }
})