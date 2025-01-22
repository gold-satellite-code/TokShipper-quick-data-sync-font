<template>
  <div id="app">
    <div class="alert alert-info">
      <p>流程为 获取链接 -- txt 转化 update_link_status 的格式 -- 使用链接后同步为已使用</p>
    </div>

    <div>
      <button @click="fetchCategories" class="btn btn-primary">获取分类信息</button>
      <div v-if="categories.length > 0">
        <h3>类别信息</h3>
        <ul>
          <li v-for="category in categories" :key="category.category_id">
            {{ category.category_id }} - {{ category.category_name }} - {{ category.description }}
          </li>
        </ul>
      </div>
    </div>

    <div>
      <select v-model="selectedCategory" class="form-control">
        <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
          {{ category.category_name }} - {{ category.description }}
        </option>
      </select>
      <input v-model="linkCount" type="number" class="form-control" placeholder="输入数量" min="1">
      <button @click="fetchUnusedLinks" class="btn btn-success">获取未使用的链接</button>
    </div>

    <div>
      <textarea v-model="linksToUpdate" class="form-control" placeholder="输入要更新的链接（逗号分隔）"></textarea>
      <button @click="updateLinkStatus" class="btn btn-warning">更新链接状态</button>
    </div>

    <div>
      <button @click="syncData" class="btn btn-info">同步数据</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  data() {
    return {
      categories: [],
      selectedCategory: null,
      linkCount: 1,
      linksToUpdate: '',
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get('/api/get_category_info');
        this.categories = response.data.categories || [];
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },
    async fetchUnusedLinks() {
      if (!this.selectedCategory) return;
      if (!this.linkCount) return;
      try {
        const response = await axios.get(`/api/get_unused_links?category_id=${this.selectedCategory}&limit=${this.linkCount}`);
        const linkData = response.data;
        if (response.status === 200) {
          const blob = new Blob([linkData], { type: 'text/plain' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `unused_links_category_${this.selectedCategory}.txt`;
          link.click();
        }
      } catch (error) {
        console.error('Error fetching unused links:', error);
      }
    },
    async updateLinkStatus() {
      const links = this.linksToUpdate.split(',').map((link) => link.trim()).filter(Boolean);
      if (!links.length) return;
      try {
        const response = await axios.post('/api/update_link_status', { links });
        alert(response.data.message || '更新成功');
      } catch (error) {
        console.error('Error updating link status:', error);
      }
    },
    async syncData() {
      try {
        const response = await axios.get('/api/synch_data');
        alert(response.data || '同步成功');
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    },
  },
  mounted() {
    this.fetchCategories();
  },
};
</script>

<style scoped>
/* Add your styles */
button {
  margin: 10px;
}

textarea {
  width: 100%;
  height: 100px;
}

select {
  margin-bottom: 10px;
}
</style>
