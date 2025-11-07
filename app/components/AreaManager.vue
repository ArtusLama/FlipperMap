<template>
    <div>
        <!-- Area polygons rendered on the map -->
        <LPolygon
            v-for="area in areas"
            :key="area.id"
            :lat-lngs="area.vertices"
            :fill="false"
            :color="area.color"
            :weight="2"
            :opacity="0.8"
            :interactive="false"
        />

        <!-- Area management interface -->
        <div class="space-y-4 mt-4">
            <h3 class="text-lg font-semibold">
                Sub-Areas
            </h3>
            <div class="grid gap-3">
                <div
                    v-for="area in areas"
                    :key="area.id"
                    class="flex items-center gap-2"
                >
                    <ColorPicker
                        :initial-color="area.color"
                        @select="(color) => handleColorChange(area.id, color)"
                    >
                        <div
                            class="w-8 h-8 rounded-md border hover:ring-2 ring-ring transition-all cursor-pointer"
                            :style="{ backgroundColor: area.color }"
                        />
                    </ColorPicker>
                    <span class="text-sm font-medium">{{ area.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import type { LatLng } from "leaflet"
import { ColorPicker } from "~/components/ui/color-picker"

interface Area {
    id: number
    name: string
    vertices: LatLng[]
    color: string
}

// Empty areas array for dynamic area management
const areas = ref<Area[]>([])

// Handler for color changes
const handleColorChange = (id: number, color: string) => {
    const area = areas.value.find(a => a.id === id)
    if (area) {
        area.color = color
    }
}
</script>
