<template>
  <div class="home">
    <div class="alert alert-info" role="alert">
      流程为 获取链接 -- txt转化update_link_status的格式 -- 使用链接后同步为已使用
    </div>

    <div class="form-group">
      <label for="categorySelect">选择分类</label>
      <select v-model="selectedCategory" @change="fetchUnusedLinks" class="form-control" id="categorySelect">
        <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
          {{ category.category_name }}
        </option>
      </select>
    </div>

    <div v-if="links.length > 0" class="mt-3">
      <button @click="downloadLinks" class="btn btn-primary">下载未使用的链接</button>
    </div>

    <div v-if="links.length === 0" class="mt-3">
      <p>暂无未使用链接。</p>
    </div>

    <div v-if="loading" class="mt-3">
      <p>加载中...</p>
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
      links: [],
      loading: false
    };
  },
  methods: {
    // 获取分类信息
    async fetchCategories() {
      try {
        const response = await axios.get('http://127.0.0.1:21312/get_category_info');
        this.categories = response.data.categories || [];
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    // 获取未使用的链接
    async fetchUnusedLinks() {
      if (!this.selectedCategory) return;

      this.loading = true;
      try {
        const response = await axios.get(`http://127.0.0.1:21312/get_unused_links?category_id=${this.selectedCategory}`);
        const linkData = response.data;

        if (response.status === 200) {
          this.links = linkData.links || [];
        } else {
          this.links = [];
        }
      } catch (error) {
        console.error("Error fetching unused links:", error);
        this.links = [];
      } finally {
        this.loading = false;
      }
    },
    // 下载未使用的链接
    downloadLinks() {
      const fileName = `unused_links_category_${this.selectedCategory}.txt`;
      const link = document.createElement('a');
      link.href = `http://127.0.0.1:21312/get_unused_links?category_id=${this.selectedCategory}`;
      link.download = fileName;
      link.click();
    },
    // 更新链接状态为已使用
    async updateLinkStatus() {
      const linksToUpdate = this.links.filter(link => link.isSelected).map(link => link.link);
      if (linksToUpdate.length === 0) return;

      try {
        const response = await axios.post('http://127.0.0.1:21312/update_link_status', { links: linksToUpdate });
        if (response.status === 200) {
          this.fetchUnusedLinks();
        }
      } catch (error) {
        console.error("Error updating link status:", error);
      }
    }
  },
  mounted() {
    this.fetchCategories();
  }
};
</script>

<style scoped>
.home {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.alert {
  font-size: 1.2em;
}

.form-group {
  margin-bottom: 20px;
}

.btn {
  width: 100%;
}
</style>
