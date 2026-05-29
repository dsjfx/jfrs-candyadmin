<template>
  <div ref="chartRef" class="visit-stats-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

interface Props {
  data: {
    labels?: string[]
    visits?: number[]
    pageviews?: number[]
  } | null
  loading: boolean
}

const props = defineProps<Props>()
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['访问量', '浏览量'],
      right: 20
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: props.data?.labels || []
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '访问量',
        position: 'left'
      },
      {
        type: 'value',
        name: '浏览量',
        position: 'right'
      }
    ],
    series: [
      {
        name: '访问量',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        lineStyle: {
          width: 3
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.1
        },
        data: props.data?.visits || []
      },
      {
        name: '浏览量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: {
          width: 3
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.1
        },
        data: props.data?.pageviews || []
      }
    ]
  }

  chart?.setOption(option)
}

const resizeChart = () => {
  chart?.resize()
}

onMounted(() => {
  if (!props.loading && props.data) {
    initChart()
    window.addEventListener('resize', resizeChart)
  }
})

onUnmounted(() => {
  chart?.dispose()
  window.removeEventListener('resize', resizeChart)
})

watch(
  () => [props.data, props.loading],
  () => {
    if (!props.loading && props.data) {
      if (chart) {
        chart.dispose()
      }
      setTimeout(initChart, 100)
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.visit-stats-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>