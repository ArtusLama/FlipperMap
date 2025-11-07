<template>
    <div class="rounded-lg space-y-4">
        <div>
            <h3 class="text-lg font-semibold">
                Add Location
            </h3>
            <p class="text-xs text-muted-foreground mt-1">
                Left-click on the map to auto-fill coordinates
            </p>
        </div>
        <div class="space-y-3 max-w-md">
            <div>
                <label class="block text-sm font-medium mb-2">Address</label>
                <div class="flex items-center gap-2">
                    <UiInput
                        v-model="address"
                        type="text"
                        placeholder="e.g. Berlin, Germany"
                    />
                    <UiButton
                        :disabled="isGeocoding || !address"
                        @click="handleGeocode"
                    >
                        {{ isGeocoding ? "Loading..." : "Search" }}
                    </UiButton>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Latitude</label>
                <UiInput
                    v-model.number="lat"
                    placeholder="e.g. 51.1657"
                />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Longitude</label>
                <UiInput
                    v-model.number="lng"
                    placeholder="e.g. 10.4515"
                />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Location Name (optional)</label>
                <UiInput
                    v-model="name"
                    type="text"
                    placeholder="e.g. Downtown, Park, Office..."
                />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Color</label>
                <div class="flex items-center gap-2">
                    <div
                        class="size-8 rounded-md border"
                        :style="{ backgroundColor: color }"
                    />
                    <ColorPicker
                        :initial-color="color"
                        @select="color = $event"
                    >
                        <UiButton variant="outline">
                            Select Color
                        </UiButton>
                    </ColorPicker>
                </div>
            </div>
        </div>
        <UiButton
            class="md:w-auto"
            @click="handleAdd"
        >
            Add Location
        </UiButton>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { storeToRefs } from "pinia"
import { toast } from "vue-sonner"
import { ColorPicker } from "~/components/ui/color-picker"
import { useCoordinatesStore } from "../stores/coordinates"
import { useLocationFormStore } from "../stores/locationForm"

const coordinatesStore = useCoordinatesStore()
const locationFormStore = useLocationFormStore()
const { address, lat, lng, name, color } = storeToRefs(locationFormStore)

const isGeocoding = ref(false)

const handleGeocode = async () => {
    if (!address.value.trim()) {
        toast.error("Please enter an address")
        return
    }

    isGeocoding.value = true
    try {
        // Germany bounding box: [minLat, minLon, maxLat, maxLon]
        // Germany roughly: 47.3° to 55.1° N, 5.9° to 15.0° E
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address.value)}&countrycodes=de`,
        )
        const results = await response.json()

        if (!results || results.length === 0) {
            toast.error("Address not found in Germany")
            return
        }

        const result = results[0]
        const newLat = parseFloat(result.lat)
        const newLng = parseFloat(result.lon)

        if (!isNaN(newLat) && !isNaN(newLng)) {
            lat.value = newLat
            lng.value = newLng
            name.value = result.display_name || address.value
            toast.success("Address found!")
        } else {
            toast.error("Invalid coordinates received")
        }
    } catch (error) {
        toast.error("Failed to geocode address")
        console.error(error)
    } finally {
        isGeocoding.value = false
    }
}

const handleAdd = () => {
    try {
        if (typeof lat.value === "undefined" || typeof lng.value === "undefined") {
            toast.error("Please enter both latitude and longitude")
            return
        }

        coordinatesStore.addCoordinate(lat.value, lng.value, name.value || undefined, color.value)
        toast.success("Location added successfully")

        // Reset form
        locationFormStore.resetForm()
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add location"
        toast.error(message)
    }
}
</script>
