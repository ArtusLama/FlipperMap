<template>
    <div class="border p-4 rounded-lg relative z-0">
        <LMap
            class="rounded-md w-full h-full"
            :center="[51.0647, 12.0128]"
            :max-bounds="maxBounds"
            :zoom="5"
            :use-global-leaflet="false"
            @click="handleMapClick"
            @contextmenu="handleMapRightClick"
            @mousemove="handleMapMouseMove"
        >
            <LTileLayer
                url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                attribution="&copy; <a href='https://stadiamaps.com/'>Stadia Maps</a>"
                layer-type="base"
                name="Dark"
                class="z-10"
            />
            <!-- Vignette overlay - darkens everything outside the bounds -->
            <!-- @vue-ignore -->
            <LPolygon
                v-if="vignettePolygon.length > 0"
                :lat-lngs="vignettePolygon"
                :fill="true"
                :fill-color="'#000000'"
                :fill-opacity="0.5"
                :stroke="false"
                :interactive="false"
            />
            <!-- Area Editor Points -->
            <AreaPoints />
            <!-- Area Manager - subdivided areas -->
            <AreaManager />
            <!-- Sub Areas -->
            <AreasOverlay />
            <LMarker
                v-for="coord in coordinates"
                :key="coord.id"
                :lat-lng="[coord.lat, coord.lng]"
            >
                <LIcon
                    class-name="relative rounded p-1 border border-white shadow-lg"
                    :icon-size="[30, 30]"
                >
                    <div
                        :style="{ backgroundColor: coord.color }"
                        class="absolute inset-0 rounded"
                    />
                    <Icon
                        :name="useLocationTypeIcon().getIconName(coord.locationType)"
                        :size="18"
                        class="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-white"
                    />
                </LIcon>

                <LTooltip>
                    {{ coord.name }}
                </LTooltip>

                <LPopup>
                    <div class="space-y-3 min-w-[200px] max-w-[280px]">
                        <div class="text-sm space-y-2">
                            <p
                                v-if="coord.name"
                                class="font-semibold"
                            >
                                {{ coord.name }}
                            </p>
                            <div
                                v-if="coord.locationType"
                                class="flex items-center gap-2 text-muted-foreground"
                            >
                                <Icon
                                    :name="useLocationTypeIcon().getIconName(coord.locationType)"
                                    :size="16"
                                    :style="{ color: coord.color }"
                                />
                                <span>{{ coord.locationType }}</span>
                            </div>
                        </div>

                        <!-- Notes Preview -->
                        <div
                            v-if="coord.notes"
                            class="text-sm"
                        >
                            <p class="font-medium mb-1">
                                Notes
                            </p>
                            <p class="whitespace-pre-wrap text-muted-foreground line-clamp-3">
                                {{ truncateNotes(coord.notes) }}
                            </p>
                        </div>

                        <!-- Images Preview -->
                        <div
                            v-if="coord.images && coord.images.length > 0"
                            class="space-y-2"
                        >
                            <p class="text-sm font-medium">
                                Images ({{ coord.images.length }})
                            </p>
                            <div class="grid grid-cols-2 gap-2">
                                <button
                                    v-for="(image, index) in coord.images.slice(0, 2)"
                                    :key="index"
                                    type="button"
                                    class="relative group aspect-square rounded overflow-hidden border border-border"
                                    @click="openImagePreview(image)"
                                >
                                    <img
                                        :src="image"
                                        :alt="`Image ${index + 1}`"
                                        class="w-full h-full object-cover"
                                    >
                                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Icon
                                            name="lucide:zoom-in"
                                            size="20"
                                            class="text-white"
                                        />
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Empty State -->
                        <div
                            v-if="!coord.notes && (!coord.images || coord.images.length === 0)"
                            class="text-center text-muted-foreground"
                        >
                            <p class="text-xs">
                                Noch keine Notizen vorhanden.
                            </p>
                        </div>

                        <!-- View All Button -->
                        <UiButton
                            v-if="hasContent(coord)"
                            size="sm"
                            variant="outline"
                            class="w-full"
                            @click="openViewDialog(coord)"
                        >
                            <Icon
                                name="lucide:maximize-2"
                                size="14"
                                class="mr-1.5"
                            />
                            View All
                        </UiButton>

                        <!-- Edit Button -->
                        <UiButton
                            size="sm"
                            class="w-full"
                            @click="openEditDialog(coord)"
                        >
                            <Icon
                                name="lucide:edit"
                                size="14"
                                class="mr-1.5"
                            />
                            Edit Details
                        </UiButton>
                    </div>
                </LPopup>
            </LMarker>
        </LMap>

        <!-- View Location Details Dialog -->
        <ViewLocationDetailsDialog
            v-if="selectedCoordinate"
            v-model:open="viewDialogOpen"
            :coordinate="selectedCoordinate"
        />

        <!-- Edit Location Content Dialog -->
        <EditLocationContentDialog
            v-if="selectedCoordinate"
            v-model:open="editDialogOpen"
            :coordinate="selectedCoordinate"
        />

        <!-- Image Preview Dialog -->
        <UiDialog v-model:open="imagePreviewOpen">
            <UiDialogContent class="max-w-5xl p-0">
                <div class="relative">
                    <img
                        v-if="previewImage"
                        :src="previewImage"
                        alt="Full size preview"
                        class="w-full h-auto"
                    >
                </div>
            </UiDialogContent>
        </UiDialog>
    </div>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner"
import { LatLng } from "leaflet"
import { useAreaEditorStore } from "~/stores/areaEditor"
import { useSubAreasStore } from "~/stores/subAreas"
import { useCoordinatesStore } from "../../stores/coordinates"
import { useLocationFormStore } from "../../stores/locationForm"
import { storeToRefs } from "pinia"
import AreaPoints from "~/components/areaEditor/AreaPoints.vue"
import type { Coordinate } from "../../../types"

const coordinatesStore = useCoordinatesStore()
const locationFormStore = useLocationFormStore()
const { coordinates } = storeToRefs(coordinatesStore)

// Area editor store
const areaEditor = useAreaEditorStore()
const subAreas = useSubAreasStore()
const { isEditing, vignettePolygon } = storeToRefs(areaEditor)

// Edit dialog state
const editDialogOpen = ref(false)
const viewDialogOpen = ref(false)
const selectedCoordinate = ref<Coordinate | null>(null)

// Image preview state
const imagePreviewOpen = ref(false)
const previewImage = ref<string | null>(null)

const openEditDialog = (coord: Coordinate) => {
    selectedCoordinate.value = coord
    editDialogOpen.value = true
}

const openViewDialog = (coord: Coordinate) => {
    selectedCoordinate.value = coord
    viewDialogOpen.value = true
}

const openImagePreview = (image: string) => {
    previewImage.value = image
    imagePreviewOpen.value = true
}

// Helper to check if content exists (show View All button)
const hasContent = (coord: Coordinate) => {
    const hasNotes = coord.notes && coord.notes.trim().length > 0
    const hasImages = coord.images && coord.images.length > 0
    return hasNotes || hasImages
}

// Truncate notes for preview
const truncateNotes = (notes: string | undefined, maxLength: number = 150) => {
    if (!notes) return ""
    if (notes.length <= maxLength) return notes
    return notes.substring(0, maxLength) + "..."
}

const MAX_BOUNDS_PADDING_RATIO = 2 // 200% padding
const maxBounds = computed<[[number, number], [number, number]] | undefined>(() => {
    if (areaEditor.isEditing || !(areaEditor.areaPoints.length > 0)) {
        return undefined
    }
    const points = areaEditor.areaPoints
    const lats = points.map(p => p.lat)
    const lngs = points.map(p => p.lng)

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const latPadding = (maxLat - minLat) * MAX_BOUNDS_PADDING_RATIO
    const lngPadding = (maxLng - minLng) * MAX_BOUNDS_PADDING_RATIO

    return [
        [minLat - latPadding, minLng - lngPadding],
        [maxLat + latPadding, maxLng + lngPadding],
    ]
})

const handleMapMouseMove = (event: { latlng: { lat: number, lng: number } }) => {
    const { latlng } = event
    const point = new LatLng(latlng.lat, latlng.lng)
    subAreas.updateMousePosition(point)
}

const handleMapRightClick = (event: { latlng: { lat: number, lng: number } }) => {
    const lat = event.latlng.lat
    const lng = event.latlng.lng
    const point = new LatLng(lat, lng)

    // Check if we're editing a sub-area first
    const editingArea = subAreas.areas.find(area => area.isEditing)
    if (editingArea) {
        subAreas.addPoint(editingArea.id, point)
        toast.info(`Point added to sub-area: ${lat.toFixed(10)}, ${lng.toFixed(10)}`)
    } else if (isEditing.value) {
        areaEditor.addPoint(point)
        toast.info(`Point added to main area: ${lat.toFixed(10)}, ${lng.toFixed(10)}`)
    }
}

const handleMapClick = (event: { latlng: { lat: number, lng: number } }) => {
    const lat = event.latlng.lat
    const lng = event.latlng.lng

    // Fill the form with coordinates on left click if we're not editing any areas
    const isEditingSubArea = subAreas.areas.some(area => area.isEditing)
    if (!isEditingSubArea && !isEditing.value) {
        locationFormStore.fillForm(lat, lng)
        toast.success(`Coordinates filled: ${lat.toFixed(10)}, ${lng.toFixed(10)}`)
    }
}
</script>

<style>
.leaflet-popup-content-wrapper {
    background-color: var(--color-background);
    color: var(--color-foreground);
}
.leaflet-popup-tip {
    background-color: var(--color-background) ;
}

.leaflet-tooltip {
    background-color: var(--color-background);
    border: none;
    color: var(--color-foreground);
}
.leaflet-tooltip::before {
    display: none;
}
</style>
