<template>
  <div class="admin-login-page">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-pattern"></div>
      <div class="bg-overlay"></div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <!-- Logo区域 -->
        <div class="login-header">
          <div class="logo-icon">
            <span>🌾</span>
          </div>
          <h1>乌东文旅</h1>
          <p>管理后台</p>
        </div>

        <!-- 表单 -->
        <el-form ref="formRef" :model="form" :rules="rules" class="login-form">
          <el-form-item prop="username">
            <div class="input-wrapper">
              <el-icon class="input-icon"><User /></el-icon>
              <el-input
                v-model="form.username"
                placeholder="请输入管理员账号"
                size="large"
                :prefix-icon="User"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="input-wrapper">
              <el-icon class="input-icon"><Lock /></el-icon>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                :prefix-icon="Lock"
                show-password
                @keyup.enter="handleLogin"
              />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" size="large" :loading="loading" class="login-btn" @click="handleLogin">
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部提示 -->
        <div class="login-footer">
          <p class="test-account">
            <el-icon><InfoFilled /></el-icon>
            测试账号：admin / admin123
          </p>
          <router-link to="/" class="back-link">
            <el-icon><ArrowLeft /></el-icon>
            返回首页
          </router-link>
        </div>
      </div>

      <!-- 装饰元素 -->
      <div class="decoration">
        <div class="decoration-item item-1">🏔️</div>
        <div class="decoration-item item-2">🌾</div>
        <div class="decoration-item item-3">🎭</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { ElMessage } from 'element-plus'
import { User, Lock, InfoFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const adminStore = useAdminStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true
  try {
    const result = await adminStore.login(form.username, form.password)
    if (result.success) {
      ElMessage.success('登录成功')
      router.push('/admin')
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('登录失败，请检查网络')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a365d 0%, #2d1b69 50%, #1a365d 100%);
  background-image:
    url('https://images.pexels.com/photos/37161573/pexels-photo-37161573.jpeg?auto=compress&cs=tinysrgb&w=800'),
    linear-gradient(135deg, rgba(26, 54, 93, 0.95) 0%, rgba(45, 27, 105, 0.9) 50%, rgba(26, 54, 93, 0.95) 100%);
  background-size: cover;
  background-position: center;

  .bg-pattern {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(45, 90, 135, 0.2) 0%, transparent 50%);
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: rgba(26, 54, 93, 0.4);
  }
}

.login-container {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 25px 80px rgba(26, 54, 93, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;

  .logo-icon {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    box-shadow: 0 8px 24px rgba(26, 54, 93, 0.3);

    span {
      font-size: 36px;
    }
  }

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: var(--text-light);
  }
}

.login-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      padding: 4px 16px;
      border-radius: 12px;
      box-shadow: 0 0 0 1px var(--border-color);
      transition: all 0.3s;

      &:hover, &.is-focus {
        box-shadow: 0 0 0 2px var(--primary-color);
      }

      .el-input__inner {
        height: 40px;
        font-size: 15px;
      }
    }
  }

  .input-wrapper {
    position: relative;

    .input-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      color: var(--text-light);
      font-size: 18px;
    }
  }

  .login-btn {
    width: 100%;
    height: 52px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    border: none;
    box-shadow: 0 8px 24px rgba(26, 54, 93, 0.3);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(26, 54, 93, 0.4);
    }

    &:active {
      transform: translateY(0);
    }
  }
}

.login-footer {
  margin-top: 28px;
  text-align: center;

  .test-account {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-light);
    padding: 10px 16px;
    background: var(--bg-light);
    border-radius: 8px;
    margin-bottom: 16px;

    .el-icon {
      color: var(--primary-color);
    }
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--primary-color);
    font-size: 14px;
    text-decoration: none;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.8;
    }

    .el-icon {
      font-size: 14px;
    }
  }
}

.decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;

  .decoration-item {
    position: absolute;
    font-size: 48px;
    opacity: 0.1;
    animation: float 6s ease-in-out infinite;
  }

  .item-1 {
    top: 15%;
    left: 10%;
    animation-delay: 0s;
  }

  .item-2 {
    top: 25%;
    right: 15%;
    animation-delay: 2s;
  }

  .item-3 {
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    margin: 0 16px;
  }

  .login-header {
    .logo-icon {
      width: 60px;
      height: 60px;

      span {
        font-size: 30px;
      }
    }

    h1 {
      font-size: 24px;
    }
  }
}
</style>
