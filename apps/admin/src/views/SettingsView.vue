<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import SettingsContactsPanel from '@/components/settings/SettingsContactsPanel.vue'
import SettingsHomePanel from '@/components/settings/SettingsHomePanel.vue'
import SettingsMaintenancePanel from '@/components/settings/SettingsMaintenancePanel.vue'
import SettingsShopPanel from '@/components/settings/SettingsShopPanel.vue'
import SettingsTaxonomyPanel from '@/components/settings/SettingsTaxonomyPanel.vue'
import SettingsThemePanel from '@/components/settings/SettingsThemePanel.vue'
import type { TaxonomyKind } from '@/api/types'

type TabKey = 'HOME' | 'SHOP' | TaxonomyKind

const activeTab = ref<TabKey>('HOME')

const tabs: { key: TabKey; label: string; hint: string; placeholder?: string }[] = [
  {
    key: 'HOME',
    label: 'Главная',
    hint: 'Волны между блоками, состав главной и порядок секций.',
  },
  {
    key: 'SHOP',
    label: 'Каталог',
    hint: 'Включайте и отключайте корзину и избранное на сайте. Без регистрации — данные гостя хранятся в браузере.',
  },
  {
    key: 'NEWS_TOPIC',
    label: 'Темы новостей',
    hint: 'Используются при создании новостей и показываются на сайте как метка темы.',
    placeholder: 'Например: Турниры',
  },
  {
    key: 'CATALOG_CATEGORY',
    label: 'Категории товаров',
    hint: 'Используются при добавлении товаров в каталог.',
    placeholder: 'Например: Форма',
  },
  {
    key: 'COACH_SPECIALTY',
    label: 'Специализации тренеров',
    hint: 'Теги на карточке тренера. Добавляйте здесь, а в карточке только выбирайте.',
    placeholder: 'Например: Техника',
  },
]

const currentTab = computed(() => tabs.find((tab) => tab.key === activeTab.value) || tabs[0])
const isHomeTab = computed(() => activeTab.value === 'HOME')
const isShopTab = computed(() => activeTab.value === 'SHOP')
const taxonomyKind = computed(() =>
  isHomeTab.value || isShopTab.value ? null : (activeTab.value as TaxonomyKind),
)
</script>

<template>
  <div>
    <PageHeader
      title="Настройки"
      description="Контакты сайта, блоки главной, функции каталога и справочники."
    />

    <SettingsMaintenancePanel />
    <SettingsThemePanel />
    <SettingsContactsPanel />

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.key"
        :label="tab.label"
        :name="tab.key"
      />
    </el-tabs>

    <div class="admin-panel p-5 sm:p-6">
      <p class="mb-4 text-sm text-slate-500">{{ currentTab.hint }}</p>

      <SettingsHomePanel v-if="isHomeTab" />
      <SettingsShopPanel v-else-if="isShopTab" />
      <SettingsTaxonomyPanel
        v-else-if="taxonomyKind"
        :key="taxonomyKind"
        :kind="taxonomyKind"
        :placeholder="currentTab.placeholder"
      />
    </div>
  </div>
</template>

<style scoped>
.settings-tabs :deep(.el-tabs__header) {
  margin-bottom: 1rem;
}
</style>
