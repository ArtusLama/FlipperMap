<template>
    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium">
                    Sub Areas
                </h3>
                <UiButton
                    v-if="!hasEditingArea"
                    variant="outline"
                    size="sm"
                    @click="handleNewArea"
                >
                    <Icon
                        name="lucide:plus"
                        class="size-4"
                    />
                </UiButton>
            </div>
            <div
                v-if="subAreas.areas.length > 0"
                class="flex flex-col gap-1 max-h-96 overflow-y-auto"
            >
                <div
                    v-for="area in subAreas.areas"
                    :key="area.id"
                    class="flex items-center justify-between p-2 rounded-md border"
                    :class="{ 'bg-accent': area.isEditing }"
                >
                    <div class="flex items-center gap-2">
                        <div
                            class="size-3 rounded-full"
                            :style="{ backgroundColor: area.color }"
                        />
                        <span class="text-sm">
                            {{ area.points.length }} points
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <!-- Done Button (only shows during initial creation) -->
                        <UiButton
                            v-if="area.isEditing"
                            variant="ghost"
                            size="sm"
                            @click="handleFinishEditing(area.id)"
                        >
                            <Icon
                                name="lucide:check"
                                class="size-4"
                            />
                        </UiButton>
                        <!-- Delete Button -->
                        <ConfirmationPopup
                            v-if="!area.isEditing"
                            @confirm="subAreas.deleteArea(area.id)"
                        >
                            <UiButton
                                variant="ghost"
                                size="sm"
                            >
                                <Icon
                                    name="lucide:trash-2"
                                    class="size-4"
                                />
                            </UiButton>
                        </ConfirmationPopup>
                    </div>
                </div>
            </div>
            <p
                v-else
                class="text-sm text-muted-foreground"
            >
                No areas added yet
            </p>
        </div>
        <hr class="border-t">
        <p
            v-if="hasEditingArea"
            class="text-xs text-muted-foreground text-center"
        >
            Right-click on the map to add points to the area
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { toast } from "vue-sonner"
import { getRandomColor } from "~/lib/utils"
import { useSubAreasStore } from "~/stores/subAreas"

const subAreas = useSubAreasStore()

// Computed property to check if any area is being edited
const hasEditingArea = computed(() => subAreas.areas.some(area => area.isEditing))

// Function to start creating a new area
function handleNewArea() {
    subAreas.startNewArea(getRandomColor())
    toast.success("Creating new area", {
        description: "Right-click on the map to add points",
    })
}

// Function to finish creating an area
function handleFinishEditing(id: string) {
    const area = subAreas.areas.find(a => a.id === id)
    if (!area) return

    if (area.points.length < 3) {
        toast.error("Cannot complete area", {
            description: "A sub-area must have at least 3 points to form a polygon",
        })
        return
    }

    subAreas.stopEditing(id)
    toast.success("Area created")
}
</script>
