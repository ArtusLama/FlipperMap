<template>
    <UiPopover
        v-model:open="isOpen"
        @update:open="handleOpenChange"
    >
        <UiPopoverTrigger :as-child="true">
            <slot>
                <UiButton variant="outline">
                    Select Color
                </UiButton>
            </slot>
        </UiPopoverTrigger>
        <UiPopoverContent class="w-60 p-3">
            <div class="space-y-4">
                <!-- Preset colors section -->
                <div class="space-y-2">
                    <div class="grid grid-cols-8 gap-2">
                        <UiButton
                            v-for="color in firstRowColors"
                            :key="color"
                            variant="ghost"
                            class="relative size-6 p-0 rounded-md transition-all hover:scale-110 hover:shadow-md"
                            :style="{ backgroundColor: color }"
                            @click="selectColor(color)"
                        >
                            <Icon
                                v-if="selectedColor === color"
                                name="lucide:check"
                                class="absolute inset-0 m-auto size-4 text-white drop-shadow-md"
                            />
                        </UiButton>
                    </div>
                    <div class="grid grid-cols-8 gap-2">
                        <UiButton
                            v-for="color in secondRowColors"
                            :key="color"
                            variant="ghost"
                            class="relative size-6 p-0 rounded-md transition-all hover:scale-110 hover:shadow-md"
                            :style="{ backgroundColor: color }"
                            @click="selectColor(color)"
                        >
                            <Icon
                                v-if="selectedColor === color"
                                name="lucide:check"
                                class="absolute inset-0 m-auto size-4 text-white drop-shadow-md"
                            />
                        </UiButton>
                    </div>
                </div>

                <!-- Custom color input -->
                <div class="flex items-center gap-2">
                    <div
                        class="size-8 aspect-square rounded-md border"
                        :style="{ backgroundColor: selectedColor }"
                    />
                    <UiInput
                        v-model="selectedColor"
                        type="text"
                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                        placeholder="#000000"
                    />
                </div>

                <!-- Select button -->
                <UiButton
                    class="w-full"
                    @click="handleSelect"
                >
                    Select Color
                </UiButton>
            </div>
        </UiPopoverContent>
    </UiPopover>
</template>

<script setup lang="ts">
import { ref } from "vue"

// Props
const props = defineProps<{
    initialColor?: string
}>()

// Emits
const emit = defineEmits<{
    select: [color: string]
}>()

// Color presets
const firstRowColors = [
    "#EF4444", // Red
    "#F97316", // Orange
    "#F59E0B", // Amber
    "#EAB308", // Yellow
    "#84CC16", // Lime
    "#22C55E", // Green
    "#10B981", // Emerald
    "#14B8A6", // Teal
]

const secondRowColors = [
    "#06B6D4", // Cyan
    "#0EA5E9", // Light Blue
    "#3B82F6", // Blue
    "#6366F1", // Indigo
    "#8B5CF6", // Violet
    "#A855F7", // Purple
    "#D946EF", // Fuchsia
    "#EC4899", // Pink
]

// State
const isOpen = ref(false)
const selectedColor = ref(props.initialColor ?? firstRowColors[0])

// Methods
function selectColor(color: string) {
    selectedColor.value = color
}

function handleSelect() {
    if (selectedColor.value) {
        emit("select", selectedColor.value)
        isOpen.value = false
    }
}

// Watch for popover open state to reset color
function handleOpenChange(open: boolean) {
    if (open) {
        // Reset to initial color when opening
        selectedColor.value = props.initialColor ?? firstRowColors[0]
    }
}
</script>
