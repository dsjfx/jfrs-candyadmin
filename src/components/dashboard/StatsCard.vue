<template>
  <el-card shadow="hover" class="stats-card">
    <div class="stats-content">
      <div class="stats-icon" :style="{ backgroundColor: color }">
        <el-icon :size="24">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stats-info">
        <div class="stats-title">{{ title }}</div>
        <div class="stats-value" v-if="!loading">
          {{ formatValue(value) }}
        </div>
        <el-skeleton-item
          v-else
          variant="text"
          style="width: 60px; height: 32px;"
        />
      </div>
    </div>
    <div class="stats-trend" v-if="!loading && trend !== undefined">
      <el-icon
        :color="trend >= 0 ? '#67c23a' : '#f56c6c'"
        :size="14"
      >
        <ArrowUp v-if="trend >= 0" />
        <ArrowDown v-else />
      </el-icon>
      <span :class="['trend-text', trend >= 0 ? 'positive' : 'negative']">
        {{ Math.abs(trend) }}%
      </span>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface Props {
  title: string
  value: number | string
  icon: any
  color: string
  trend?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trend: undefined,
  loading: false
})

const formatValue = (value: number | string) => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return value
}
</script>

<style lang="scss" scoped>
.stats-card {
  border: none;
  border-radius: 8px;
  
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stats-content {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  .stats-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    
    .el-icon {
      color: white;
    }
  }
  
  .stats-info {
    flex: 1;
    
    .stats-title {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .stats-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }
}

.stats-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  
  .trend-text {
    font-weight: 500;
    
    &.positive {
      color: #67c23a;
    }
    
    &.negative {
      color: #f56c6c;
    }
  }
}
</style>