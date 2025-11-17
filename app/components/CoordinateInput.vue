<template>
    <div class="rounded-lg space-y-4">
        <div>
            <h3 class="text-lg font-semibold">
                Standort hinzufügen
            </h3>
            <p class="text-xs text-muted-foreground mt-1">
                Links-Klicke auf die Karte, um die Koordinaten automatisch auszufüllen.
            </p>
        </div>
        <div class="space-y-3 max-w-md">
            <div>
                <label class="block text-sm font-medium mb-2">Breitengrad</label>
                <UiInput
                    v-model.number="lat"
                />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Längengrad</label>
                <UiInput
                    v-model.number="lng"
                />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Standortname (optional)</label>
                <UiInput
                    v-model="name"
                    type="text"
                />
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Farbe</label>
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
                            <Icon
                                name="lucide:edit-3"
                                class="size-4 mr-2"
                            />
                            auswählen
                        </UiButton>
                    </ColorPicker>
                </div>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Kategorie</label>
                <LocationTypeSelect v-model="locationType" />
            </div>
        </div>
        <UiButton
            class="md:w-auto"
            @click="handleAdd"
        >
            <Icon
                name="lucide:plus"
                class="size-4 mr-2"
            />
            Hinzufügen
        </UiButton>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { toast } from "vue-sonner"
import { ColorPicker } from "~/components/ui/color-picker"
import { useCoordinatesStore } from "../stores/coordinates"
import { useLocationFormStore } from "../stores/locationForm"

const coordinatesStore = useCoordinatesStore()
const locationFormStore = useLocationFormStore()
const { lat, lng, name, color, locationType } = storeToRefs(locationFormStore)

const handleAdd = () => {
    try {
        if (typeof lat.value === "undefined" || typeof lng.value === "undefined") {
            toast.error("Bitte geben Sie gültige Koordinaten ein")
            return
        }

        coordinatesStore.addCoordinate(lat.value, lng.value, name.value || undefined, color.value, locationType.value)
        toast.success("Standort erfolgreich hinzugefügt")

        // Reset form
        locationFormStore.resetForm()
    } catch (error) {
        const message = error instanceof Error ? error.message : "Fehler beim Hinzufügen des Standorts"
        toast.error(message)
    }
}
</script>
