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

    <!-- 订单统计 - 按大类目统计 -->
    <div>
      <h3>订单统计 - 按大类目统计</h3>
      <table class="table table-striped">
        <thead>
        <tr>
          <th>类别ID</th>
          <th>类别名称</th>
          <th style="width: 100px;">类别中文名</th>
          <th>利润</th>
          <th>成本</th>
          <th>用户支付总额</th>
          <th>订单数</th>
          <th>平均利润</th>
          <th>平均成本</th>
          <th>平均用户价格</th>
          <th>平均运费税</th>
          <th>平均商品总价税</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="result in orderStatisticsForRootCategory" :key="result.category_id">
          <td>{{ result.category_id }}</td>
          <td>{{ result.category_name }}</td>
          <td>{{ result.description }}</td>
          <td>{{ result.profit }}</td>
          <td>{{ result.chengben }}</td>
          <td>{{ result.userpay }}</td>
          <td>{{ result.orderCount }}</td>
          <td>{{ result.avgProfit }}</td>
          <td>{{ result.avgChengben }}</td>
          <td>{{ result.avgUserPrice }}</td>
          <td>{{ result.avgfeeTax }}</td>
          <td>{{ result.avgproductTax }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h3>订单统计 - 根据选择的类目</h3>
      <select v-model="selectedCategoryForOrderStatistics" class="form-control" @change="fetchOrderDataForSelectedCategory">
        <option v-for="category in categories" :key="category.category_id" :value="category.category_id">
          {{ category.category_name }} - {{ category.description }}
        </option>
      </select>
      <h3>订单统计 - 根据类目统计</h3>
      <table class="table table-striped">
        <thead>
        <tr>
          <th>类别ID</th>
          <th>类别名称</th>
          <th style="width: 100px;">类别中文名</th>
          <th>利润</th>
          <th>成本</th>
          <th>订单数</th>
          <th>用户支付总额</th>
          <th>平均利润</th>
          <th>平均成本</th>
          <th>平均用户价格</th>
          <th>平均运费税</th>
          <th>平均商品总价税</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="result in orderStatisticsForOneRootCategory" :key="result.category_id">
          <td>{{ result.category_id }}</td>
          <td>{{ result.category_name }}</td>
          <td>{{ result.description }}</td>
          <td>{{ result.profit }}</td>
          <td>{{ result.chengben }}</td>
          <td>{{ result.orderCount }}</td>
          <td>{{ result.userpay }}</td>
          <td>{{ result.avgProfit }}</td>
          <td>{{ result.avgChengben }}</td>
          <td>{{ result.avgUserPrice }}</td>
          <td>{{ result.avgfeeTax }}</td>
          <td>{{ result.avgproductTax }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h3>订单明细</h3>
      <table class="table table-striped">
        <thead>
        <tr>
          <th>订单ID</th>
          <th>类别ID</th>
          <th>类别名称</th>
          <th style="width: 100px;">类别中文名</th>
          <th>利润</th>
          <th>成本</th>
          <th>用户支付总额</th>
          <th>运费税</th>
          <th>商品总价税</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="result in orderDetailsForOneRootCategory" :key="result.order_id">
          <td>{{ result.order_id }}</td>
          <td>{{ result.category_id }}</td>
          <td>{{ result.category_name }}</td>
          <td>{{ result.description }}</td>
          <td>{{ result.profit }}</td>
          <td>{{ result.chengben }}</td>
          <td>{{ result.userpay }}</td>
          <td>{{ result.feeTax }}</td>
          <td>{{ result.productTax }}</td>
        </tr>
        </tbody>
      </table>
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
      orderStatisticsForRootCategory: [],
      selectedCategoryForOrderStatistics: null,
      orderStatisticsForOneRootCategory: null,
      orderDetailsForOneRootCategory: null,
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
    async fetchOrderStatisticsForRootCategory() {
      try {
        const response = await axios.get('/api/get_order_statistic_root_category');
        this.orderStatisticsForRootCategory = response.data.results || [];
      } catch (error) {
        console.error('Error fetching order statistics for root category:', error);
      }
    },
    async fetchOrderStatisticsForOneRootCategory() {
      try {
        const response = await axios.get(`/api/get_order_statistic_one_root_category?category_id=${this.selectedCategoryForOrderStatistics}`);
        this.orderStatisticsForOneRootCategory = response.data.results || [];
      } catch (error) {
        console.error('Error fetching order statistics for root category:', error);
      }
    },
    async fetchOrderDetailsForOneRootCategory() {
      try {
        const response = await axios.get(`/api/get_order_detail_one_root_category?category_id=${this.selectedCategoryForOrderStatistics}`);
        this.orderDetailsForOneRootCategory = response.data.results || [];
      } catch (error) {
        console.error('Error fetching order statistics for root category:', error);
      }
    },
    async fetchOrderDataForSelectedCategory() {
      try {
        await this.fetchOrderStatisticsForOneRootCategory();
        await this.fetchOrderDetailsForOneRootCategory();
      } catch (error) {
        console.error('Error fetching order data:', error);
      }
    },
  },
  mounted() {
    this.fetchCategories();
    this.fetchOrderStatisticsForRootCategory();
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


table {
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  text-align: left;
}

th, td {
  padding: 12px 15px;
  border: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f1f1f1;
}
</style>
