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

type TabKey = 'SITE' | 'HOME' | 'SHOP' | 'DICTIONARIES'

const activeTab = ref<TabKey>('SITE')
const dictKind = ref<TaxonomyKind>('NEWS_TOPIC')

const tabs: { key: TabKey; label: string }[] = [
  { key: 'SITE', label: 'Сайт' },
  { key: 'HOME', label: 'Главная' },
  { key: 'SHOP', label: 'Каталог' },
  { key: 'DICTIONARIES', label: 'Справочники' },
]

const dictionaries: { key: TaxonomyKind; label: string; hint: string; placeholder: string }[] = [
  {
    key: 'NEWS_TOPIC',
    label: 'Темы новостей',
    hint: 'Метка темы на карточке и в фильтре новостей.',
    placeholder: 'Например: Турниры',
  },
  {
    key: 'CATALOG_CATEGORY',
    label: 'Категории товаров',
    hint: 'Категории при добавлении товаров в каталог.',
    placeholder: 'Например: Форма',
  },
  {
    key: 'COACH_SPECIALTY',
    label: 'Специализации тренеров',
    hint: 'Теги на карточке тренера. Здесь добавляете, в карточке выбираете.',
    placeholder: 'Например: Техника',
  },
]

const currentDict = computed(
  () => dictionaries.find((item) => item.key === dictKind.value) ?? dictionaries[0]!,
)
</script>

<template>
  <div class="settings-page">
    <PageHeader
      title="Настройки"
      description="Сайт, главная, каталог и справочники в одном месте."
    />

    <div class="settings-nav" role="tablist" aria-label="Разделы настроек">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="settings-nav__btn"
        :class="{ 'is-active': activeTab === tab.key }"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="settings-body">
      <section v-show="activeTab === 'SITE'" class="settings-stack">
        <div class="settings-grid">
          <SettingsMaintenancePanel />
          <SettingsThemePanel />
        </div>
        <SettingsContactsPanel />
      </section>

      <section v-show="activeTab === 'HOME'">
        <p class="settings-lead">
          Состав и порядок блоков на главной. Для каталога, новостей, отзывов, галереи и тренеров
          нужен контент и свитч «На сайте» в своём разделе.
        </p>
        <SettingsHomePanel />
      </section>

      <section v-show="activeTab === 'SHOP'">
        <p class="settings-lead">
          Корзина и избранное на сайте. Без регистрации — данные гостя хранятся в браузере.
        </p>
        <SettingsShopPanel />
      </section>

      <section v-show="activeTab === 'DICTIONARIES'">
        <div class="settings-subnav" role="tablist" aria-label="Справочники">
          <button
            v-for="item in dictionaries"
            :key="item.key"
            type="button"
            class="settings-subnav__btn"
            :class="{ 'is-active': dictKind === item.key }"
            @click="dictKind = item.key"
          >
            {{ item.label }}
          </button>
        </div>
        <p class="settings-lead">{{ currentDict.hint }}</p>
        <SettingsTaxonomyPanel
          :key="currentDict.key"
          :kind="currentDict.key"
          :placeholder="currentDict.placeholder"
        />
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 0.3rem;
  border-radius: 0.85rem;
  background: #eef2f7;
  width: fit-content;
  max-width: 100%;
}

.settings-nav__btn {
  height: 2.15rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 0.6rem;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
}

.settings-nav__btn:hover {
  color: #1e293b;
}

.settings-nav__btn.is-active {
  background: #fff;
  color: #0f766e;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.08);
}

.settings-body {
  padding: 1.25rem 1.35rem 1.4rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
}

.settings-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.settings-grid > :only-child {
  grid-column: 1 / -1;
}

.settings-lead {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #64748b;
}

.settings-subnav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
}

.settings-subnav__btn {
  height: 2rem;
  padding: 0 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 650;
  cursor: pointer;
}

.settings-subnav__btn:hover {
  border-color: #cbd5e1;
  color: #334155;
}

.settings-subnav__btn.is-active {
  border-color: #0f766e;
  background: #f0fdfa;
  color: #0f766e;
}

@media (max-width: 760px) {
  .settings-nav {
    width: 100%;
  }

  .settings-nav__btn {
    flex: 1;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
