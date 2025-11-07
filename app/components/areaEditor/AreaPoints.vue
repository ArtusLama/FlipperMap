<template>
    <template v-if="isEditing || points.length > 0">
        <LPolyline
            :lat-lngs="points"
            :color="isEditing ? '#ff4444' : '#ffffff'"
            :weight="2"
            :dash-array="isEditing ? '5, 10' : ''"
        />
        <LCircleMarker
            v-for="(point, index) in points"
            :key="index"
            :lat-lng="point"
            :radius="6"
            :color="isEditing ? '#ff4444' : '#ffffff'"
            :fill="true"
            :fill-color="isEditing ? '#ff4444' : '#ffffff'"
            :fill-opacity="0.8"
            :weight="2"
        >
            <LTooltip v-if="isEditing">
                Point {{ index + 1 }}
            </LTooltip>
        </LCircleMarker>
    </template>
</template>

<script setup lang="ts">
import { useAreaEditorStore } from "~/stores/areaEditor"
import { storeToRefs } from "pinia"

const areaEditor = useAreaEditorStore()
const { isEditing, points } = storeToRefs(areaEditor)
</script>
