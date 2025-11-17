<template>
    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">
                    Gebiete ({{ areas.length }})
                </h3>
                <UiButton
                    v-if="!hasEditingArea || isCreating"
                    variant="outline"
                    size="sm"
                    @click="isCreating ? handleCancelNewArea() : handleNewArea()"
                >
                    <Icon
                        :name="isCreating ? 'lucide:x' : 'lucide:plus'"
                        class="size-4"
                    />
                </UiButton>
            </div>
            <div
                v-if="areas.length > 0"
                class="flex flex-col gap-1 max-h-96 overflow-y-auto"
            >
                <div
                    v-for="area in areas"
                    :key="area.id"
                    class="flex items-center justify-between p-2 rounded-md border"
                    :class="{ 'bg-red-400/10 border-red-400/25 animate-pulse': area.isEditing }"
                >
                    <div class="flex items-center gap-2">
                        <ColorPicker
                            :initial-color="area.color"
                            @select="(color) => handleColorChange(area.id, color)"
                        >
                            <div
                                class="size-6 aspect-square rounded-sm cursor-pointer hover:ring-2 ring-ring transition-all"
                                :style="{ backgroundColor: area.color }"
                            />
                        </ColorPicker>
                        <span class="text-sm">
                            <!-- show dynamic points count while editing, otherwise show the area's name (letter) -->
                            <template v-if="area.isEditing">
                                {{ area.points.length }} Punkte
                            </template>
                            <template v-else>
                                {{ area.name }}
                            </template>
                        </span>
                    </div>
                    <div class="flex gap-2">
                        <!-- Done Button (only shows during initial creation) -->
                        <UiButton
                            v-if="area.isEditing"
                            variant="outline"
                            size="sm"
                            class="hover:bg-green-400/25!"
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
            <p
                v-else
                class="text-sm text-muted-foreground"
            >
                Noch keine Teilbereiche hinzugefügt
            </p>
        </div>
        <hr class="border-t">
        <p
            v-if="hasEditingArea"
            class="text-xs text-muted-foreground text-center"
        >
            Rechtsklick auf die Karte, um Punkte zum Bereich hinzuzufügen
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { toast } from "vue-sonner"
import { getRandomColor } from "~/lib/utils"
import { useSubAreasStore } from "~/stores/subAreas"
import { ColorPicker } from "~/components/ui/color-picker"

const subAreas = useSubAreasStore()
const { areas } = storeToRefs(subAreas)

// Function to handle color changes
function handleColorChange(id: string, color: string) {
    subAreas.updateAreaColor(id, color)
    toast.success("Farbe aktualisiert")
}

// Computed property to check if any area is being edited
const hasEditingArea = computed(() => areas.value.some(area => area.isEditing))

// Computed: true when a newly-created area is currently being edited
const isCreating = computed(() => areas.value.some(area => subAreas.isDraft(area.id) && area.isEditing))

// Cancel creation of the new area (remove it)
function handleCancelNewArea() {
    const creating = areas.value.find(a => subAreas.isDraft(a.id) && a.isEditing)
    if (!creating) return
    subAreas.deleteArea(creating.id)
    toast.success("Bereichserstellung abgebrochen")
}

// Function to start creating a new area
function handleNewArea() {
    subAreas.startNewArea(getRandomColor())
    toast.success("Neuer Bereich wird erstellt", {
        description: "Rechtsklick auf die Karte, um Punkte hinzuzufügen",
    })
}

// Function to finish creating an area
function handleFinishEditing(id: string) {
    const area = areas.value.find(a => a.id === id)
    if (!area) return

    if (area.points.length < 3) {
        toast.error("Bereich kann nicht abgeschlossen werden", {
            description: "Ein Teilbereich benötigt mindestens 3 Punkte, um ein Polygon zu bilden",
        })
        return
    }

    subAreas.stopEditing(id)
    toast.success("Bereich erstellt")
}
</script>
