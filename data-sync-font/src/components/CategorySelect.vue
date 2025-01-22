<template>
  <div>
    <!-- 提示信息 -->
    <p>流程为 获取链接 -- txt转化update_link_status的格式 -- 使用链接后同步为已使用</p>

    <!-- 获取类别按钮 -->
    <button @click="getCategories">获取类别</button>

    <!-- 类别选择下拉框 -->
    <select v-model="selectedCategory" v-if="categories.length > 0">
      <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
        {{ category.category_name }} - {{ category.description }}
      </option>
    </select>

    <!-- 选择类别后的未使用链接按钮 -->
    <button v-if="selectedCategory" @click="getUnusedLinks">获取未使用链接</button>

    <!-- 同步LR数据到US数据库按钮 -->
    <button @click="syncData">同步LR数据到US数据库</button>

    <!-- 更新链接为已使用状态按钮 -->
    <button @click="updateLinkStatus">更新链接为已使用状态</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      categories: [], // 存储类别信息
      selectedCategory: null, // 当前选择的类别ID
      unusedLinks: [], // 存储未使用链接
    };
  },
  methods: {
    // 获取类别信息
    async getCategories() {
      try {
        const response = await fetch('/get_category_info');
        const data = await response.json();
        if (data.categories) {
          this.categories = data.categories;
        } else {
          alert('没有获取到类别信息');
        }
      } catch (error) {
        console.error('获取类别失败:', error);
        alert('获取类别信息失败');
      }
    },

    // 获取未使用的链接
    async getUnusedLinks() {
      if (!this.selectedCategory) {
        alert('请选择一个类别');
        return;
      }

      try {
        const response = await fetch(`/get_unused_links?category_id=${this.selectedCategory}`);
        const data = await response.json();
        if (response.ok) {
          // 如果请求成功，处理返回的未使用链接
          this.unusedLinks = data.links || [];
          alert('获取未使用链接成功');
        } else {
          alert(data || '未找到未使用的链接');
        }
      } catch (error) {
        console.error('获取未使用链接失败:', error);
        alert('获取未使用链接失败');
      }
    },

    // 同步LR数据到US数据库
    async syncData() {
      try {
        const response = await fetch('/synch_data');
        if (response.ok) {
          alert('LR数据同步到US数据库成功');
        } else {
          alert('LR数据同步失败');
        }
      } catch (error) {
        console.error('同步数据失败:', error);
        alert('同步数据失败');
      }
    },

    // 更新链接为已使用状态
    async updateLinkStatus() {
      const link = prompt('请输入要更新的链接');
      if (link) {
        try {
          const response = await fetch('/update_link_status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ links: [link] }),
          });

          const data = await response.json();
          if (response.ok) {
            alert(`更新链接状态成功: ${data.message}`);
          } else {
            alert(data.error || '更新链接状态失败');
          }
        } catch (error) {
          console.error('更新链接状态失败:', error);
          alert('更新链接状态失败');
        }
      }
    },
  },
};
</script>

<style scoped>
/* 添加你自己的样式 */
button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
}

select {
  margin: 10px;
  padding: 5px;
}
</style>
