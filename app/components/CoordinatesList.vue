<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
                Standorte ({{ coordinates.length }})
            </h3>
            <div class="flex gap-1">
                <LocationDataManagerExportButton />
                <LocationDataManagerImportButton />
            </div>
        </div>
        <div
            v-if="coordinates.length === 0"
            class="text-sm text-muted-foreground py-4"
        >
            Noch keine Standorte! Fügen Sie einen Standort über das Formular oben hinzu.
        </div>
        <div
            v-else
            class="space-y-2 max-h-96 overflow-y-auto"
        >
            <div
                v-for="coord in coordinates"
                :key="coord.id"
                class="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors"
            >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <ColorPicker
                        :initial-color="coord.color"
                        @select="(color) => handleColorChange(coord.id, color)"
                    >
                        <div
                            class="w-6 h-6 rounded-sm shrink-0 hover:ring-2 ring-ring transition-all cursor-pointer"
                            :style="{ backgroundColor: coord.color }"
                        />
                    </ColorPicker>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <p
                                v-if="coord.name"
                                class="font-medium text-sm truncate"
                            >
                                {{ coord.name }}
                            </p>
                            <div
                                v-if="coord.locationType"
                                class="flex items-center gap-1 text-xs text-muted-foreground"
                            >
                                <Icon
                                    :name="getCategoryIcon(coord.locationType)"
                                    class="size-3"
                                />
                                <span>{{ coord.locationType }}</span>
                            </div>
                        </div>
                        <p class="text-xs text-muted-foreground">
                            {{ coord.lat.toFixed(4) }}, {{ coord.lng.toFixed(4) }}
                        </p>
                    </div>
                </div>
                <ConfirmationPopup @confirm="handleDelete(coord.id)">
                    <UiButton
                        class="ml-2 h-8 px-2 hover:bg-red-500/25!"
                        size="sm"
                        variant="outline"
                    >
                        <Icon name="lucide:trash-2" />
                    </UiButton>
                </ConfirmationPopup>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner"
import { ColorPicker } from "~/components/ui/color-picker"
import { storeToRefs } from "pinia"
import { useCoordinatesStore } from "../stores/coordinates"
import type { LocationType } from "../../types"

const coordinatesStore = useCoordinatesStore()
const { coordinates } = storeToRefs(coordinatesStore)

const handleDelete = (id: string) => {
    coordinatesStore.removeCoordinate(id)
    toast.success("Standort gelöscht")
}

const handleColorChange = (id: string, color: string) => {
    coordinatesStore.updateCoordinate(id, { color })
    toast.success("Farbe aktualisiert")
}

const getCategoryIcon = (locationType: LocationType): string => {
    const icons: Record<LocationType, string> = {
        Pflegeheim: "lucide:users",
        Krankenhaus: "lucide:hospital",
        Rettungswache: "lucide:ambulance",
        Arztpraxis: "lucide:briefcase-medical",
    }
    return icons[locationType] || "lucide:map-pin"
}
</script>
