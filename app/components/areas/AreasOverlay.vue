<template>
    <template
        v-for="area in areas"
        :key="area.id"
    >
        <!-- Completed Area - just shows polygon outline -->
        <LPolygon
            v-if="!area.isEditing && area.points.length > 2"
            :lat-lngs="area.points"
            :color="area.color"
            :weight="2"
            :fill="false"
            :opacity="0.8"
        />

        <!-- Area under editing - shows points and line -->
        <template v-if="area.isEditing">
            <!-- Solid line connecting existing points -->
            <LPolyline
                v-if="area.points.length > 1"
                :lat-lngs="area.points"
                :color="area.color"
                :weight="2"
                :opacity="0.8"
            />
            <!-- Preview line for next point -->
            <LPolyline
                :lat-lngs="getPreviewPoints(area.id)"
                :color="area.color"
                :weight="2"
                :dash-array="'5, 10'"
                :opacity="0.6"
            />
            <!-- Individual points -->
            <LCircleMarker
                v-for="(point, index) in area.points"
                :key="`${area.id}-${index}`"
                :lat-lng="point"
                :radius="8"
                :color="area.color"
                :fill="true"
                :fill-color="area.color"
                :fill-opacity="0.8"
                :weight="2"
            >
                <LTooltip :permanent="true">
                    Point {{ index + 1 }}
                </LTooltip>
            </LCircleMarker>
            <!-- Current editing indicator -->
            <LCircleMarker
                v-if="area.points.length > 0"
                :lat-lng="area.points[area.points.length - 1] ?? [0, 0]"
                :radius="12"
                :color="area.color"
                :fill="false"
                :weight="2"
                :dash-array="'5, 10'"
                :opacity="0.5"
            />
        </template>
    </template>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useSubAreasStore } from "~/stores/subAreas"

const subAreas = useSubAreasStore()
const { areas } = storeToRefs(subAreas)
const { getPreviewPoints } = subAreas
</script>
