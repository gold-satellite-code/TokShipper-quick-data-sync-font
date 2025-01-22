<template>
  <div id="app">
    <!-- 提示信息 -->
    <div class="alert alert-info">
      <p>流程为 获取链接 -- txt转化update_link_status的格式 -- 使用链接后同步为已使用</p>
    </div>

    <!-- 分类信息展示 -->
    <div>
      <button @click="getCategoryInfo" class="btn btn-primary">获取分类信息</button>
      <div v-if="categories.length > 0">
        <h3>类别信息</h3>
        <ul>
          <li v-for="category in categories" :key="category.category_id">
            {{ category.category_id }} - {{ category.category_name }} - {{ category.description }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 获取未使用链接 -->
    <div>
      <input v-model="categoryId" type="number" placeholder="输入 category_id" class="form-control">
      <input v-model="limit" type="number" placeholder="输入 limit" class="form-control" min="1">
      <button @click="getUnusedLinks" class="btn btn-success">获取未使用的链接</button>
    </div>

    <!-- 上传并更新链接状态 -->
    <div>
      <textarea v-model="linksToUpdate" placeholder="输入要更新的链接（逗号分隔）" class="form-control"></textarea>
      <button @click="updateLinkStatus" class="btn btn-warning">更新链接状态</button>
    </div>

    <!-- 同步数据 -->
    <div>
      <button @click="syncData" class="btn btn-info">同步数据</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      categories: [],
      categoryId: '',
      linksToUpdate: '',
      limit: 10,  // 默认限制为10
    };
  },
  methods: {
    // 获取分类信息
    async getCategoryInfo() {
      try {
        const response = await axios.get('http://localhost:21312/get_category_info');
        if (response.data.categories) {
          this.categories = response.data.categories;
        } else {
          alert('No category data found.');
        }
      } catch (error) {
        alert('Error fetching categories: ' + error.response?.data?.error || error.message);
      }
    },

    // 获取未使用的链接
    async getUnusedLinks() {
      if (!this.categoryId) {
        alert('category_id is required');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:21312/get_unused_links?category_id=${this.categoryId}&limit=${this.limit}`);
        const blob = new Blob([response.data], {type: 'text/plain'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `unused_links_category_${this.categoryId}.txt`;
        link.click();
      } catch (error) {
        alert('Error fetching unused links: ' + error.response?.data || error.message);
      }
    },

    // 更新链接状态
    async updateLinkStatus() {
      const links = this.linksToUpdate.split(',').map(link => link.trim()).filter(Boolean);
      if (!links.length) {
        alert('No links provided.');
        return;
      }
      try {
        const response = await axios.post('http://localhost:21312/update_link_status', {links});
        alert(response.data.message);
      } catch (error) {
        alert('Error updating link status: ' + error.response?.data?.error || error.message);
      }
    },

    // 同步数据
    async syncData() {
      try {
        const response = await axios.get('http://localhost:21312/synch_data');
        alert(response.data || 'Data sync completed');
      } catch (error) {
        alert('Error syncing data: ' + error.response?.data || error.message);
      }
    },
  },
};
</script>

<style scoped>
/* Add some basic styles */
#app {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

button {
  margin: 10px 0;
}

textarea {
  width: 100%;
  height: 100px;
}

input {
  width: 100%;
  margin-bottom: 10px;
}
</style>
