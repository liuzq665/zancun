<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { USE_MOCK, BASE_URL } from '@/api/request';

onLaunch(async () => {
  console.log(`[乌东文旅] 启动，API=${BASE_URL}，mock=${USE_MOCK}`);
  const userStore = useUserStore();
  if (userStore.token && !userStore.profile) {
    try {
      await userStore.loadProfile();
    } catch {
      userStore.logout();
    }
  }
});
</script>

<style>
page {
  background: #f5f5f5;
}
</style>
