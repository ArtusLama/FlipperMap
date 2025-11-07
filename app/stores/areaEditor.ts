import { acceptHMRUpdate, defineStore } from "pinia"
import { LatLng } from "leaflet"
import { useStorage } from "@vueuse/core"
import { computed } from "vue"

interface SerializedPoint {
    lat: number
    lng: number
}

interface SerializedAreaEditor {
    isEditing: boolean
    points: SerializedPoint[]
    areaPoints: SerializedPoint[]
}

function serializeLatLng(point: LatLng): SerializedPoint {
    return { lat: point.lat, lng: point.lng }
}

function deserializeLatLng(point: SerializedPoint): LatLng {
    return new LatLng(point.lat, point.lng)
}

const STORAGE_KEY = "flippermap_area_editor"

export const useAreaEditorStore = defineStore("areaEditor", () => {
    // Persistent state with serialization
    const serializedState = useStorage<SerializedAreaEditor>(STORAGE_KEY, {
        isEditing: false,
        points: [],
        areaPoints: [],
    })

    // Computed state with automatic serialization/deserialization
    const isEditing = computed({
        get: () => serializedState.value.isEditing,
        set: (value: boolean) => {
            serializedState.value.isEditing = value
        },
    })

    const points = computed({
        get: () => serializedState.value.points.map(deserializeLatLng),
        set: (value: LatLng[]) => {
            serializedState.value.points = value.map(serializeLatLng)
        },
    })

    const areaPoints = computed({
        get: () => serializedState.value.areaPoints.map(deserializeLatLng),
        set: (value: LatLng[]) => {
            serializedState.value.areaPoints = value.map(serializeLatLng)
        },
    })

    // Getters
    const vignettePolygon = computed((): [number, number][][] => {
        const currentPoints = isEditing.value && points.value.length > 0
            ? points.value
            : areaPoints.value

        if (currentPoints.length < 3) {
            return []
        }

        return [
            // Outer bounds (covering whole map)
            [
                [-90, -180],
                [-90, 180],
                [90, 180],
                [90, -180],
                [-90, -180],
            ],
            // Inner bounds (edited area)
            currentPoints.map(p => [p.lat, p.lng]),
        ]
    })

    // Actions
    function toggleEditing() {
        if (isEditing.value) {
            // If we're finishing editing and have points, save them
            if (points.value.length > 2) {
                areaPoints.value = [...points.value]
            }
            points.value = []
        }
        isEditing.value = !isEditing.value
    }

    function addPoint(point: LatLng) {
        if (!isEditing.value) return
        points.value = [...points.value, point]
    }

    function resetPoints() {
        points.value = []
        if (isEditing.value) {
            isEditing.value = false
        }
    }

    return {
        isEditing,
        points,
        areaPoints,
        vignettePolygon,
        toggleEditing,
        addPoint,
        resetPoints,
    }
})

// Add HMR support
if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAreaEditorStore, import.meta.hot))
}
