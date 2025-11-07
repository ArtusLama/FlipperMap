<template>
    <div class="border p-4 rounded-lg relative z-0">
        <LMap
            class="rounded-md w-full h-full"
            :zoom="12"
            :min-zoom="12"
            :center="[50.90473937988281, 13.672101020812988]"
            :max-bounds="[
                [50.71377944946289, 13.429581642150879],
                [50.9613971, 13.8799701],
            ]"
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
            <LPolygon
                v-if="vignettePolygon.length > 0"
                :lat-lngs="vignettePolygon as any"
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
            <LCircleMarker
                v-for="coord in coordinates"
                :key="coord.id"
                :lat-lng="[coord.lat, coord.lng]"
                :radius="8"
                :color="coord.color"
                :fill="true"
                :fill-color="coord.color"
                :fill-opacity="0.8"
                :weight="2"
            >
                <LTooltip
                    :permanent="true"
                    :interactive="false"
                >
                    {{ coord.name || `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}` }}
                </LTooltip>
                <LPopup>
                    <div class="text-sm">
                        <p
                            v-if="coord.name"
                            class="font-semibold"
                        >
                            {{ coord.name }}
                        </p>
                        <p>{{ coord.lat.toFixed(4) }}, {{ coord.lng.toFixed(4) }}</p>
                    </div>
                </LPopup>
            </LCircleMarker>
        </LMap>
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

const coordinatesStore = useCoordinatesStore()
const locationFormStore = useLocationFormStore()
const { coordinates } = storeToRefs(coordinatesStore)

// Area editor store
const areaEditor = useAreaEditorStore()
const subAreas = useSubAreasStore()
const { isEditing, vignettePolygon } = storeToRefs(areaEditor)

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
        toast.info(`Point added to sub-area: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    } else if (isEditing.value) {
        areaEditor.addPoint(point)
        toast.info(`Point added to main area: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
}

const handleMapClick = (event: { latlng: { lat: number, lng: number } }) => {
    const lat = event.latlng.lat
    const lng = event.latlng.lng

    // Fill the form with coordinates on left click if we're not editing any areas
    const isEditingSubArea = subAreas.areas.some(area => area.isEditing)
    if (!isEditingSubArea && !isEditing.value) {
        locationFormStore.fillForm(lat, lng)
        toast.success(`Coordinates filled: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
}
</script>
