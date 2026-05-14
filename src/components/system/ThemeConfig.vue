<template>
    <el-form :model="localValue" label-width="120px">
        <el-form-item label="管理后台主题">
            <el-radio-group v-model="localValue.theme_admin">
                <el-radio value="light">浅色模式</el-radio>
                <el-radio value="dark">深色模式</el-radio>
                <el-radio value="auto">跟随系统</el-radio>
            </el-radio-group>
        </el-form-item>

        <el-form-item label="主题主色调">
            <el-color-picker v-model="localValue.theme_primary_color" show-alpha />
            <span class="form-tip-inline">点击选择颜色</span>
        </el-form-item>

        <el-form-item label="侧边栏默认状态">
            <el-switch v-model="localValue.theme_sidebar_collapsed" active-text="收起" inactive-text="展开" />
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    modelValue: {
        theme_admin: 'light' | 'dark' | 'auto';
        theme_primary_color: string;
        theme_sidebar_collapsed: boolean;
    };
}>();

const emit = defineEmits(['update:modelValue']);

const localValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>