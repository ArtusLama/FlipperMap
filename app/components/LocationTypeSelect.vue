<template>
    <UiSelect v-model="model">
        <UiSelectTrigger>
            <UiSelectValue placeholder="Kategorie auswählen" />
        </UiSelectTrigger>
        <UiSelectContent>
            <UiSelectItem
                v-for="(category, key) in categories"
                :key="key"
                :value="key"
            >
                <Icon
                    :name="category.icon"
                    class="size-4 mr-2"
                />
                {{ category.name }}
            </UiSelectItem>
        </UiSelectContent>
    </UiSelect>
</template>

<script setup lang="ts">
import type { LocationType } from "../../types"

const model = defineModel<LocationType | undefined>()

const categories: Record<LocationType, { name: string, icon: string }> = {
    Pflegeheim: { name: "Pflegeheim", icon: "lucide:users" },
    Krankenhaus: { name: "Krankenhaus", icon: "lucide:hospital" },
    Rettungswache: { name: "Rettungswache", icon: "lucide:ambulance" },
    Arztpraxis: { name: "Arztpraxis", icon: "lucide:briefcase-medical" },
}
</script>
