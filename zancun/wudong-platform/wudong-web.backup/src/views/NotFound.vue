<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1>页面未找到</h1>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <div class="actions">
        <el-button type="primary" size="large" @click="$router.push('/')">返回首页</el-button>
        <el-button size="large" @click="$router.back()">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .not-found-content {
    text-align: center;
    color: white;

    .error-code {
      font-size: 150px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 20px;
      text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    }

    h1 {
      font-size: 32px;
      margin-bottom: 16px;
    }

    p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 40px;
    }

    .actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  }
}
</style>
