<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-title">
        <h2>
          <el-icon><Setting /></el-icon>
          系统设置
        </h2>
        <p class="header-subtitle">配置平台参数和功能开关</p>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="settings-grid">
      <!-- 网站配置 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>网站配置</span>
          </div>
        </template>
        <el-form :model="websiteForm" label-width="120px" class="settings-form">
          <el-form-item label="网站名称">
            <el-input v-model="websiteForm.siteName" placeholder="请输入网站名称" />
          </el-form-item>
          <el-form-item label="网站Logo">
            <el-input v-model="websiteForm.logo" placeholder="请输入Logo URL" />
          </el-form-item>
          <el-form-item label="网站描述">
            <el-input v-model="websiteForm.description" type="textarea" :rows="3" placeholder="请输入网站描述" />
          </el-form-item>
          <el-form-item label="SEO关键字">
            <el-input v-model="websiteForm.keywords" placeholder="请输入关键字，多个用逗号分隔" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveWebsite" class="save-btn">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 联系方式 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Phone /></el-icon>
            <span>联系方式</span>
          </div>
        </template>
        <el-form :model="contactForm" label-width="120px" class="settings-form">
          <el-form-item label="客服电话">
            <el-input v-model="contactForm.phone" placeholder="请输入客服电话" />
          </el-form-item>
          <el-form-item label="客服邮箱">
            <el-input v-model="contactForm.email" placeholder="请输入客服邮箱" />
          </el-form-item>
          <el-form-item label="微信公众号">
            <el-input v-model="contactForm.wechat" placeholder="请输入微信公众号" />
          </el-form-item>
          <el-form-item label="公司地址">
            <el-input v-model="contactForm.address" placeholder="请输入公司地址" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveContact" class="save-btn">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 预订配置 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Calendar /></el-icon>
            <span>预订配置</span>
          </div>
        </template>
        <el-form :model="bookingForm" label-width="140px" class="settings-form">
          <el-form-item label="允许预订天数">
            <el-input-number v-model="bookingForm.advanceDays" :min="1" :max="90" />
            <span class="form-tip">可提前预订的天数</span>
          </el-form-item>
          <el-form-item label="最晚取消时间">
            <el-input-number v-model="bookingForm.cancelHours" :min="1" :max="72" />
            <span class="form-tip">小时前可免费取消</span>
          </el-form-item>
          <el-form-item label="订单超时">
            <el-input-number v-model="bookingForm.orderTimeout" :min="5" :max="60" />
            <span class="form-tip">分钟未支付自动取消</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBooking" class="save-btn">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 其他设置 -->
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <el-icon><Grid /></el-icon>
            <span>其他设置</span>
          </div>
        </template>
        <el-form :model="otherForm" label-width="120px" class="settings-form">
          <el-form-item label="开启注册">
            <el-switch v-model="otherForm.allowRegister" active-color="#166534" />
          </el-form-item>
          <el-form-item label="开启评论">
            <el-switch v-model="otherForm.allowComment" active-color="#166534" />
          </el-form-item>
          <el-form-item label="开启积分">
            <el-switch v-model="otherForm.enablePoints" active-color="#166534" />
          </el-form-item>
          <el-form-item label="维护模式">
            <el-switch v-model="otherForm.maintenanceMode" active-color="#f56c6c" />
            <span class="form-tip danger">开启后普通用户无法访问</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveOther" class="save-btn">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Monitor, Phone, Calendar, Grid } from '@element-plus/icons-vue'
import { getConfigs, updateConfig } from '@/api/admin'

const websiteForm = reactive({
  siteName: '乌东文旅综合服务平台',
  logo: '',
  description: '乌东村文化旅游综合服务平台，为您提供最地道的苗族侗族文化体验',
  keywords: '乌东村,苗族文化,侗族文化,旅游,非遗,民宿,餐饮',
})

const contactForm = reactive({
  phone: '400-888-8888',
  email: 'service@wudong.com',
  wechat: '乌东文旅',
  address: '贵州省黔东南苗族侗族自治州雷山县',
})

const bookingForm = reactive({
  advanceDays: 30,
  cancelHours: 24,
  orderTimeout: 30,
})

const otherForm = reactive({
  allowRegister: true,
  allowComment: true,
  enablePoints: true,
  maintenanceMode: false,
})

// 每组的表单对应一个配置键，整体以 JSON 存在 app_config 里
const GROUP_KEYS = {
  website: 'site_website',
  contact: 'site_contact',
  booking: 'site_booking',
  other: 'site_other',
}

const loadConfigs = async () => {
  try {
    const res = await getConfigs()
    if (res.code !== 0) return
    const map = {}
    ;(res.data || []).forEach((c) => {
      map[c.configKey] = c.configValue
    })
    if (map[GROUP_KEYS.website]) Object.assign(websiteForm, map[GROUP_KEYS.website])
    if (map[GROUP_KEYS.contact]) Object.assign(contactForm, map[GROUP_KEYS.contact])
    if (map[GROUP_KEYS.booking]) Object.assign(bookingForm, map[GROUP_KEYS.booking])
    if (map[GROUP_KEYS.other]) Object.assign(otherForm, map[GROUP_KEYS.other])
  } catch (error) {
    console.error('Failed to load configs:', error)
  }
}

const saveGroup = async (key, form, label) => {
  try {
    const res = await updateConfig(key, { ...form })
    if (res.code === 0) {
      ElMessage.success(`${label}已保存`)
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('Failed to save config:', error)
  }
}

const saveWebsite = () => saveGroup(GROUP_KEYS.website, websiteForm, '网站配置')
const saveContact = () => saveGroup(GROUP_KEYS.contact, contactForm, '联系方式')
const saveBooking = () => saveGroup(GROUP_KEYS.booking, bookingForm, '预订配置')
const saveOther = () => saveGroup(GROUP_KEYS.other, otherForm, '其他设置')

onMounted(loadConfigs)
</script>

<style scoped lang="scss">
.settings-page {
  .page-header {
    margin-bottom: 28px;

    .header-title {
      h2 {
        font-size: 22px;
        font-weight: 600;
        color: var(--primary-color);
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;

        .el-icon {
          color: var(--secondary-color);
        }
      }

      .header-subtitle {
        font-size: 14px;
        color: var(--text-light);
      }
    }
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .settings-card {
    :deep(.el-card__header) {
      border-bottom: 1px solid var(--border-color);
      padding: 16px 20px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: var(--primary-color);

      .el-icon {
        font-size: 18px;
        color: var(--secondary-color);
      }
    }

    .settings-form {
      .form-tip {
        margin-left: 12px;
        color: var(--text-light);
        font-size: 13px;
      }

      .form-tip.danger {
        color: var(--chinese-red);
      }

      .save-btn {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border: none;
        width: 120px;
      }
    }
  }
}

@media (max-width: 1200px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
