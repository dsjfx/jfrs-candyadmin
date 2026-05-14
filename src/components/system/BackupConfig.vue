<template>
    <el-form :model="localValue" label-width="150px">
        <el-form-item label="启用自动备份">
            <el-switch v-model="localValue.backup_enable_auto" />
            <span class="form-tip-inline">开启后系统将定时备份数据库</span>
        </el-form-item>

        <el-form-item label="自动备份时间">
            <el-input v-model="localValue.backup_auto_schedule" placeholder="0 2 * * *" style="width: 300px"
                :disabled="!localValue.backup_enable_auto" />
            <div class="form-tip">Cron表达式，例如：0 2 * * * 表示每天凌晨2点执行</div>
        </el-form-item>

        <el-form-item label="备份保留天数">
            <el-input-number v-model="localValue.backup_retention_days" :min="1" :max="365"
                :disabled="!localValue.backup_enable_auto" />
            <span class="form-tip-inline">天，超过天数的备份将被自动删除</span>
        </el-form-item>

        <el-form-item v-if="!localValue.backup_enable_auto">
            <el-alert title="自动备份已关闭" type="warning" description="建议开启自动备份，以防数据丢失" show-icon :closable="false" />
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: {
        backup_auto_schedule: string;
        backup_retention_days: number;
        backup_enable_auto: boolean;
    };
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
.form-tip-inline {
    margin-left: 12px;
    color: #909399;
    font-size: 14px;
}
</style>