<template>
    <div class="rounded-lg space-y-4">
        <div>
            <h3 class="text-lg font-semibold">
                Add Location
            </h3>
            <p class="text-xs text-muted-foreground mt-1">
                Right-click on the map to auto-fill coordinates
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
                    type="number"
                    placeholder="e.g. 51.1657"
                    step="0.0001"
                />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Longitude</label>
                <UiInput
                    v-model.number="lng"
                    type="number"
                    placeholder="e.g. 10.4515"
                    step="0.0001"
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
                    <button
                        type="button"
                        class="w-10 h-10 rounded-sm shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                        :style="{ backgroundColor: color }"
                        @click="handleColorClick"
                    />
                    <input
                        ref="colorInput"
                        v-model="color"
                        type="color"
                        class="hidden"
                    >
                    <UiInput
                        v-model="color"
                        type="text"
                        placeholder="#3B82F6"
                    />
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
import { toast } from "vue-sonner"
import useLocationForm from "~/composables/useLocationForm"

const coordinates = useCoordinates()
const locationForm = useLocationForm()

const { address, lat, lng, name, color } = locationForm
const colorInput = ref<HTMLInputElement>()
const isGeocoding = ref(false)

const handleColorClick = () => {
    colorInput.value?.click()
}

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
        lat.value = parseFloat(result.lat)
        lng.value = parseFloat(result.lon)
        name.value = result.display_name || address.value

        toast.success("Address found!")
    } catch (error) {
        toast.error("Failed to geocode address")
        console.error(error)
    } finally {
        isGeocoding.value = false
    }
}

const handleAdd = () => {
    try {
        const latNum = Number(lat.value)
        const lngNum = Number(lng.value)

        if (!lat.value || !lng.value || isNaN(latNum) || isNaN(lngNum)) {
            toast.error("Please enter both latitude and longitude")
            return
        }

        coordinates.addCoordinate(latNum, lngNum, name.value || undefined, color.value)
        toast.success("Location added successfully")

        // Reset form
        locationForm.resetForm()
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to add location"
        toast.error(message)
    }
}
</script>
