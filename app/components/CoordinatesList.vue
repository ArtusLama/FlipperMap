<template>
    <div class="space-y-2">
        <h3 class="text-lg font-semibold">
            Saved Locations ({{ coordinates.coordinates.value.length }})
        </h3>
        <div
            v-if="coordinates.coordinates.value.length === 0"
            class="text-sm text-muted-foreground py-4"
        >
            No locations yet. Add one to get started!
        </div>
        <div
            v-else
            class="space-y-2 max-h-96 overflow-y-auto"
        >
            <div
                v-for="coord in coordinates.coordinates.value"
                :key="coord.id"
                class="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors"
            >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div
                        class="w-6 h-6 rounded-sm shrink-0"
                        :style="{ backgroundColor: coord.color }"
                    />
                    <div class="flex-1 min-w-0">
                        <p
                            v-if="coord.name"
                            class="font-medium text-sm truncate"
                        >
                            {{ coord.name }}
                        </p>
                        <p class="text-xs text-muted-foreground">
                            {{ coord.lat.toFixed(4) }}, {{ coord.lng.toFixed(4) }}
                        </p>
                    </div>
                </div>
                <UiButton
                    class="ml-2 h-8 px-2 hover:bg-red-500/25!"
                    size="sm"
                    variant="outline"
                    @click="handleDelete(coord.id)"
                >
                    Delete
                </UiButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner"
import useCoordinates from "~/composables/useCoordinates"

const coordinates = useCoordinates()

const handleDelete = (id: string) => {
    coordinates.removeCoordinate(id)
    toast.success("Location deleted")
}
</script>
