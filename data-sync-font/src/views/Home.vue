<script>
import axios from 'axios';

// 设置全局基础URL
// const BASE_URL = 'http://127.0.0.1:21312';
const BASE_URL = 'http://192.168.3.47:21312';

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
        const response = await axios.get(`${BASE_URL}/get_category_info`);
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
        const response = await axios.get(`${BASE_URL}/get_unused_links?category_id=${this.selectedCategory}`);
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
      link.href = `${BASE_URL}/get_unused_links?category_id=${this.selectedCategory}`;
      link.download = fileName;
      link.click();
    },
    // 更新链接状态为已使用
    async updateLinkStatus() {
      const linksToUpdate = this.links.filter(link => link.isSelected).map(link => link.link);
      if (linksToUpdate.length === 0) return;

      try {
        const response = await axios.post(`${BASE_URL}/update_link_status`, {links: linksToUpdate});
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
