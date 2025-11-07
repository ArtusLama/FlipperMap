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
            @contextmenu="handleMapRightClick"
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
                :lat-lngs="([outerBounds, innerBounds] as any)"
                :fill="true"
                :fill-color="'#000000'"
                :fill-opacity="0.5"
                :stroke="false"
                :interactive="false"
            />
            <!-- Area Manager - subdivided areas -->
            <AreaManager />
            <LCircleMarker
                v-for="coord in coordinates.coordinates.value"
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
import useCoordinates from "~/composables/useCoordinates"
import useLocationForm from "~/composables/useLocationForm"

const coordinates = useCoordinates()
const locationForm = useLocationForm()

// Vignette overlay bounds
const outerBounds: LatLng[] = [
    new LatLng(-90, -180),
    new LatLng(-90, 180),
    new LatLng(90, 180),
    new LatLng(90, -180),
    new LatLng(-90, -180),
]

const innerBounds: LatLng[] = [
    new LatLng(50.71377944946289, 13.429581642150879),
    new LatLng(50.74, 13.42),
    new LatLng(50.77, 13.41),
    new LatLng(50.8, 13.41),
    new LatLng(50.83, 13.42),
    new LatLng(50.85, 13.45),
    new LatLng(50.86, 13.50),
    new LatLng(50.86, 13.55),
    new LatLng(50.85, 13.60),
    new LatLng(50.83, 13.63),
    new LatLng(50.80, 13.65),
    new LatLng(50.77, 13.66),
    new LatLng(50.74, 13.66),
    new LatLng(50.71, 13.65),
    new LatLng(50.68, 13.63),
    new LatLng(50.66, 13.60),
    new LatLng(50.65, 13.55),
    new LatLng(50.65, 13.50),
    new LatLng(50.66, 13.45),
    new LatLng(50.68, 13.42),
    new LatLng(50.71377944946289, 13.429581642150879),
]

const handleMapRightClick = (event: { latlng: { lat: number, lng: number } }) => {
    // Get coordinates from the click event
    const lat = event.latlng.lat
    const lng = event.latlng.lng

    // Fill the form with the clicked coordinates
    locationForm.fillForm(lat, lng)

    toast.success(`Coordinates filled: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
}
</script>
