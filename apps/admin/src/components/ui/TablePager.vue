<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    total: number
    pageSizes?: number[]
  }>(),
  {
    pageSizes: () => [5, 10, 20, 50],
  },
)

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })

const showPager = computed(() => props.total > pageSize.value)
</script>

<template>
  <div v-if="total > 0" class="table-pager">
    <el-select
      v-model="pageSize"
      class="table-pager__size"
      aria-label="Записей на странице"
    >
      <el-option
        v-for="size in pageSizes"
        :key="size"
        :label="String(size)"
        :value="size"
      />
    </el-select>

    <span class="table-pager__total">Всего {{ total }}</span>

    <el-pagination
      v-if="showPager"
      v-model:current-page="page"
      :page-size="pageSize"
      background
      layout="prev, pager, next"
      :total="total"
    />
  </div>
</template>

<style scoped>
.table-pager {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.table-pager__size {
  width: 4.5rem;
}

.table-pager__total {
  color: rgb(100 116 139);
  font-size: 0.875rem;
  white-space: nowrap;
}
</style>
